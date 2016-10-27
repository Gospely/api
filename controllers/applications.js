var util = require('../utils.js');
var models = require('../models');
var config = require('../configs');
var shells = require('../shell');
var parse = require('co-body');
var uuid = require('node-uuid')
var transliteration = require('transliteration');
var portManager = require('../port');
var common = require('./common');

var applications = {};
//数据渲染，todo:分页参数引入，异常信息引入
function render(data,all,cur,code,message) {

	return {
		code: code,
		message: message,
		all: all,
		cur: cur,
		fields: data
	}
}

applications.create = function*() {


  if ('POST' != this.method) this.throw(405, "method is not allowed");
    var application = yield parse(this, {
      limit: '1kb'
    });
		console.log(application);
    //应用中文转英文
    var domain  = application.name;
    var reg = /[\u4e00-\u9FA5]+/;
    var res = reg.test(domain);

    if(res){
      var tr = transliteration.transliterate
      domain = tr(domain).replace(new RegExp(" ",'gm'),"").toLocaleLowerCase();
    }
		application.id = uuid.v4();
    var inserted = yield  models.gospel_domains.create({
				subDomain: domain + "_" +application.creator,
        domain: config.dnspod.baseDomain,
        ip: '120.76.235.234',
				application: application.id,
        creator: application.creator,
				sub: true
    });
		console.log(inserted);
		if(inserted.code == 'failed') {
				this.body = render(null,null,null,-1, "二级域名解析失败，请重命名应用名");
		}else{
			try{
					application.appPort  = yield portManager.generatePort();
	        var data = yield shells.domain({
	          user: application.creator,
	          domain: domain  + "_" + application.creator,
	          port: application.appPort,
	        });
	        console.log(data);
	        if(data == 'success'){
	          // var data = yield shells.nginx();
	          // console.log(data);
	          //创建并启动docker

						application.socketPort = yield portManager.generatePort();
						if(application.appPort == application.socketPort){
							application.appPort  = yield portManager.generatePort();
						}
	        	application.sshPort = yield portManager.generatePort();
						if(application.sshPort == application.socketPort){

	            application.socketPort = yield portManager.generatePort();
	          }

	          var data = yield shells.docker({
	            name: application.creator + "_" + domain,
	            sshPort: application.sshPort,
	            socketPort: application.socketPort,
							appPort: application.appPort,
	            password: application.password,
							memory: application.memory,
	          });
						application.docker = 'gospel_project_' + application.creator + "_" + domain;
						application.status = 1;
						application.domain = domain;
						delete application['memory'];
						var inserted = yield models.gospel_applications.create(application);
	          console.log(data);
	          if(data == 'success'){
	            this.body = render(inserted,null,null,1,'创建应用成功');
	          }else{
	            this.body = render(null,null,null,-1,'创建应用失败');
	          }
	        }else{
	          this.body = render(null,null,null,-1,'创建应用失败');
	        }

	    }catch(err){
	        console.log(err);
	        throw err;
	    }
		}

}

module.exports = applications;
