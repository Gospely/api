var util = require('../utils.js');
var shells = require('../shell');
var models = require('../models');
var parse = require('co-body');

//数据渲染，todo:分页参数引入，异常信息引入
function render(data, code, message) {

	return {
		code: code,
		message: message,
		fields: data
	}
}
var gits = {};

gits.gitChange = function*() {

    var id = this.params.id;
    var application = yield models.gospel_applications.findById(id);
    var result = yield shells.gitChange({
        docker: application.docker,
        host: application.host
    });
    var result = result.split('\n'),
        message = '',
        arr = new Array();
    for (var i = 0; i < result.length; i++) {
        if(result[i] != ""){
            message = result[i].split(' ');
            if(message.length == 3){
                arr.push({
                    type: message[1],
                    file: message[2]
                })
            }else{
                if(message[0] == '??'){
                    arr.push({
                        type: 'A',
                        file: message[1]
                    })

                }else{
                    arr.push({
                        type: message[0],
                        file: message[1]
                    })

                }
            }
        }
    }
    this.body = render(arr, 1, 'success');
}
gits.gitCommit = function*() {

	var id = this.params.id;
    var application = yield models.gospel_applications.findById(id);
    var message = this.query.message;

	var result = yield shells.gitCommit({
		docker: application.docker,
		host: application.host,
		message: message
	});
	this.body = render(result, 1, 'git pull 完成');

}
gits.gitOrigin = function*() {

	var application = yield parse(this, {
			limit: '10kb'
		});
	application = JSON.parse(application);

	var app = yield models.gospel_applications.findById(application.id),
		options = {
			docker: app.docker,
			host: app.host,
			git: application.git,
			user: application.user,
			email: application.email
		}
	if(app.git == null || app.git == undefined || app.git == ''){
		options.addOrigin = true;
	}else{
		options.addOrigin = false;
	}
	var result = yield shells.gitOrigin(options);
	yield models.gospel_applications.modify({
		id: application.id,
		git: application.git,
		gitUser: application.user,
		gitEmail: application.email
	});
	if(result == 'success'){
		yield models.gospel_applications.modify({
			id: application.id,
			git: application.git,
			gitUser: application.user,
			gitEmail: application.email
		});
		this.body = render(null, 1, '修改源成功');
	}else{
		this.body = render(null, -1, result);

	}
}
gits.gitPush = function*() {

	var id = this.params.id;
	var branch = this.query.branch;
	if(branch == null){
		branch = 'master'
	}
    var application = yield models.gospel_applications.findById(id);
    var result = yield shells.gitPush({
        docker: application.docker,
        host: application.host,
		branch: branch
    });
	this.body = render(result, 1, 'git push 完成');
}
gits.gitPull = function*() {
	var id = this.params.id;
	var branch = this.query.branch;
	if(branch == null){
		branch = 'master'
	}
	var application = yield models.gospel_applications.findById(id);
	var result = yield shells.gitPull({
		docker: application.docker,
		host: application.host,
		branch: branch
	});
	this.body = render(result, 1, 'git pull 完成');
}


module.exports = gits;
