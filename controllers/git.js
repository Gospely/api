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

    var commits = yield parse(this, {
    		limit: '10240kb'
    	});
    var message = commits.message;
    var files = JSON.parse(commits.files),
        addFiles = new Array();
    for (var i = 0; i < files.length; i++) {
        if(files[i].type == 'A') {
            addFiles.push(files[i].name)
        }
    }
}
gits.gitOrigin = function*() {
    
}
gits.gitPush = function*() {

}
gits.gitPull = function*() {

}


module.exports = gits;
