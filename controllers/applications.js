var util = require('../utils.js');
var models = require('../models');
var config = require('../configs');
var shells = require('../shell');
var parse = require('co-body');
var uuid = require('node-uuid')
var transliteration = require('transliteration');
var portManager = require('../port');
var common = require('./common');
var processes =  require('../process');

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
				subDomain: domain + "-" +application.creator,
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
					application.port  = yield portManager.generatePort();
	        var data = yield shells.domain({
	          user: application.creator,
	          domain: domain  + "-" + application.creator,
	          port: application.appPort,
	        });
	        console.log(data);
	        if(data == 'success'){
	          var data = yield shells.nginx();
	          // console.log(data);
	          //创建并启动docker

						application.socketPort = yield portManager.generatePort();
						if(application.port == application.socketPort){
							application.port  = yield portManager.generatePort();
						}
	        	application.sshPort = yield portManager.generatePort();
						if(application.sshPort == application.socketPort){

	            application.socketPort = yield portManager.generatePort();
	          }

	          var data = yield shells.docker({
	            name: application.creator + "_" + domain,
	            sshPort: application.sshPort,
	            socketPort: application.socketPort,
							appPort: application.port,
	            password: application.password,
							memory: application.memory,
							file: application.imageName
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

applications.list = function* () {

	var domain = 'test1111';
  var data ={
			subDomain: domain + "-" +1,
			domain: config.dnspod.baseDomain,
			ip: '120.76.235.234',
			application: 11111,
			creator: 1,
			sub: true
	};
	console.log("test");
	var node = processes.init({
		do: function*() {
			var self = this;
			var inserted = yield models.gospel_domains.create(self.data);

			if(inserted.code == 'failed') {
					throw("二级域名解析失败，请重命名应用名");
			}
		},
		data: {
				subDomain: domain + "-" +1,
				domain: config.dnspod.baseDomain,
				ip: '120.76.235.234',
				application: 11111,
				creator: 1,
				sub: true
		},
		undo: function*() {
			console.log(data);
			console.log("undo first");
		},
	})

	node = processes.buildNext(node, {
		do: function*() {
				var self = this;
				var result = yield shells.domain(self.data);
				if(result != 'success'){
						throw('创建应用失败');
				}
			},
		data: {
			user: 1,
			domain: domain  + "-" + 1,
			port: 1111,
		},
		undo: function*() {

			var self = this;
			var name = self.data.domain.replace('-','_')
			yield shells.delNginxConf(name);
			yield shells.nginx();
			console.log("undo second");
		},
	});
	node = processes.buildNext(node, {
		do: function*() {
				console.log("third do");
			},
		data: 'third data',
		undo: function*() {
			console.log("undo third");
		},
	});
	node = processes.buildNext(node, {
		do: function*() {
				console.log("fourth do");
			},
		data: 'third data',
		undo: function*() {
			console.log("undo fourth");
		},
	});
	yield node.excute();

}
module.exports = applications;
