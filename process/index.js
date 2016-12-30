var processes = require('./processor');
var models = require('../models');
var config = require('../configs');
var shells = require('../shell');
var uuid = require('node-uuid')
var transliteration = require('transliteration');
var portManager = require('../port');
var dnspod = require('../server/dnspod');
var selector = require('../utils/selector');

module.exports = {

	fast_deploy: function*(application){

		console.log(application);
		var domain = application.name;
		var user = yield models.gospel_users.findById(application.creator);
		var host = yield this.hostFilter(user, false);
			host = host.ip;

		application.userName = user.name;
		var reg = /[\u4e00-\u9FA5]+/;
		var res = reg.test(domain);

		if (res) {
			var tr = transliteration.transliterate
			domain = tr(domain).replace(new RegExp(" ", 'gm'), "").toLocaleLowerCase();
		}
		application.userName = application.userName.toLocaleLowerCase();
		domain = domain.replace('_', '');
		//二级域名解析
		var node = processes.init({
			do: function*() {
				var self = this;
				var inserted = yield models.gospel_domains.create(self.data);
				self.data = inserted;
				if (inserted.code == 'failed') {
					throw ("二级域名解析失败，请重命名应用名");
				}
			},
			data: {
				subDomain: domain + "-" + application.userName,
				domain: config.dnspod.baseDomain,
				host: host,
				ip: '120.76.235.234',
				application: application.id,
				creator: application.creator,
				sub: true
			},
			undo: function*() {

				var self = this;
				console.log(self.data.message);
				var options = {
					method: 'recordRemove',
					opp: 'recordRemove',
					param: {
						domain: "gospely.com",
						record_id: self.data.message.record
					}
				}

				var result = yield dnspod.domainOperate(options);
				if (result.status.code == '1') {
					yield models.gospel_domains.delete(self.data.message.id);
				}
				console.log("undo first");
			},
		});

		//nginx配置文件
		application.port = yield portManager.generatePort();
		node = processes.buildNext(node, {
			do: function*() {

				console.log("success");
				var self = this;
				var result = yield shells.domain(self.data);
				if (result != 'success') {
					throw ('创建应用失败');
				}
			},
			data: {
				user: application.creator,
				domain: domain + "-" + application.userName,
				port: application.port,
				host: host,
			},
			undo: function*() {

				var self = this;
				var name = self.data.domain.replace('-', '_')
				yield shells.delNginxConf({
					name: name,
					host: host,
				});
				yield shells.nginx({
					host: host
				});
				console.log("undo domain");
			},
		});

		//docker 创建

		//var data = yield shells.nginx();
		// console.log(data);
		//创建并启动docker

		application.socketPort = yield portManager.generatePort(host);
		if (application.port == application.socketPort) {
			application.port = yield portManager.generatePort(host);
		}
		application.sshPort = yield portManager.generatePort(host);
		if (application.sshPort == application.socketPort) {

			application.socketPort = yield portManager.generatePort(host);
		}
		application.dbPort = yield portManager.generatePort(host);
		if(application.dbPort == application.socketPort || application.dbPort == application.sshPort || application.dbPort == application.port){
			application.dbPort = yield portManager.generatePort(host);
		}
		var docker = yield models.gospel_products.findById(application.products);
		var unit = "";
		if (docker.memoryUnit == "MB") {
			unit = 'm'
		} else {
			unit = 'g'
			application.memory = 1024 * application.memory;
		}
		application.memory = docker.memory + unit;

		node = processes.buildNext(node, {
			do: function*() {
				var self = this;
				var result = yield shells.fast_deploy(self.data);
				yield shells.mvFiles({
					host: host,
					name: domain + "_" + application.userName,
				});
				yield shells.changePWD({
					host: host,
					name: domain + "_" + application.userName,
					password: application.sshPassword
				});
				// if(application.git) {
				// 	console.log("gicone");
				// 	shells.gitClone({
				// 		user: application.creator,
				// 		projectname: domain + "_" + application.userName,
				// 		gitURL: application.git,
				// 	});
				// }
				if (result != 'success') {
					throw ('创建应用失败');
				}
			},
			data: {
				host: host,
				name: domain + "_" + application.userName,
				sshPort: application.sshPort,
				socketPort: application.socketPort,
				appPort: application.port,
				password: application.password,
				memory: application.memory,
				image: application.image,
				dbUser: application.dbUser,
				db: application.databaseType,
				hostName: domain,
				dbPort: application.dbPort,
				creator: application.creator
			},
			undo: function*() {

				var self = this;
				yield shells.stopDocker({
					host: host,
					name: self.data.name
				});
				yield shells.rmDocker({
					host: host,
					name: self.data.name
				});
				yield shells.rmFile("/var/www/storage/codes/" + self.data.name)
				console.log("undo docker");
			},
		});



		//将应用记录存储到数据库
		application.docker = 'gospel_project_' + domain + "_" + application.userName;
		application.status = 1;
		application.domain = domain + "-" + application.userName;
		delete application['memory'];
		node = processes.buildNext(node, {
			do: function*() {
				var self = this;
				var inserted = yield models.gospel_applications.modify({
					id: application.id,
					status: 1,
					domain: application.domain,
					docker: application.docker,
					sshPort: application.sshPort,
					port: application.port,
					password: application.password,
					socketPort: application.socketPort,
					host: host
				});
				self.data = inserted;
				application = inserted;
				if (!inserted) {
					throw ('创建应用失败');
				}
			},
			data: application,
			undo: function*() {
				var self = this;
				console.log("undo application");
				yield models.gospel_applications.delete(self.data.id);
			},
		});
		var result = yield node.excute();
		return result;
	},
	app_start: function* (application) {


		var domain = application.name;
		var user = yield models.gospel_users.findById(application.creator);
		var host = user.host;


		console.log(host);

		application.userName = user.name;
		var reg = /[\u4e00-\u9FA5]+/;
		var res = reg.test(domain);

		if (res) {
			var tr = transliteration.transliterate
			domain = tr(domain).replace(new RegExp(" ", 'gm'), "").toLocaleLowerCase();
		}
		application.userName = application.userName.toLocaleLowerCase();
		domain = domain.replace('_', '');
		//commit 镜像
		var node = processes.init({
			do: function* () {
				var self = this;
				console.log(host);

				var result = yield shells.commit(self.data);

				console.log(result);
				var imageId = result.split(":")[1];
				var result = yield shells.dockerPush({
					host: host,
					imageId: imageId,
					name: domain + "-" + application.userName,
				});
			},
			data: {
				name: domain + "-" + application.userName,
				user: application.userName,
				host: host,
				docker: application.docker,
			},
			undo: function* () {

				var self = this;
				console.log(self.data.message);
				var options = {
					method: 'recordRemove',
					opp: 'recordRemove',
					param: {
						domain: "gospely.com",
						record_id: self.data.message.record
					}
				}

				var result = yield dnspod.domainOperate(options);
				if (result.status.code == '1') {
					yield models.gospel_domains.delete(self.data.message.id);
				}
				console.log("undo first");
			},
		});

		node = processes.buildNext(node,{
			do: function* () {
				var self = this;
				var inserted = yield models.gospel_domains.create(self.data);
				self.data = inserted;
				if (inserted.code == 'failed') {
					throw ("二级域名解析失败，请重命名应用名");
				}
			},
			data: {
				subDomain: domain + "-" + application.userName,
				domain: config.dnspod.baseDomain,
				host: host,
				application: application.id,
				creator: application.creator,
				sub: true
			},
			undo: function* () {

				var self = this;
				console.log(self.data.message);
				var options = {
					method: 'recordRemove',
					opp: 'recordRemove',
					param: {
						domain: "gospely.com",
						record_id: self.data.message.record
					}
				}

				var result = yield dnspod.domainOperate(options);
				if (result.status.code == '1') {
					yield models.gospel_domains.delete(self.data.message.id);
				}
				console.log("undo first");
			},
		});

		//nginx配置文件
		application.port = yield portManager.generatePort();
		node = processes.buildNext(node, {
			do: function* () {

				console.log("success");
				var self = this;
				var result = yield shells.domain(self.data);
				if (result != 'success') {
					throw ('创建应用失败');
				}
			},
			data: {
				host: host,
				user: application.creator,
				domain: domain + "-" + application.userName,
				port: application.port,
			},
			undo: function* () {

				var self = this;
				var name = self.data.domain.replace('-', '_')
				yield shells.delNginxConf({
					projectname: name,
					host: host,
				});
				yield shells.nginx({
					host: host,
				});
				console.log("undo domain");
			},
		});

		//docker 创建

		//var data = yield shells.nginx();
		// console.log(data);
		//创建并启动docker

		var unit = "";
		if (docker.memoryUnit == "MB") {
			unit = 'm'
		} else {
			unit = 'g'
			application.memory = 1024 * application.memory;
		}
		application.memory = docker.memory + unit;

		node = processes.buildNext(node, {
			do: function* () {
				var self = this;
				var result = yield shells.docker(self.data);
				if (application.git) {
					console.log("gicone");
					shells.gitClone({
						host: host,
						user: application.creator,
						projectname: domain + "_" + application.userName,
						gitURL: application.git,
					});
				}
				if (result != 'success') {
					throw ('创建应用失败');
				}
			},
			data: {
				host: host,
				name: domain + "_" + application.userName,
				sshPort: application.sshPort,
				socketPort: application.socketPort,
				appPort: application.port,
				password: application.password,
				memory: application.memory,
				file: application.image,
				hostName: domain,
				creator: application.creator
			},
			undo: function* () {

				var self = this;
				yield shells.stopDocker({
					host: host,
					docker: self.data.name
				});
				yield shells.rmDocker({
					host: host,
					docker: self.data.name
				});
				yield shells.rmFile("/var/www/storage/codes/" + self.data.name)
				console.log("undo docker");
			},
		});



		//将应用记录存储到数据库
		application.docker = 'gospel_project_' + domain + "_" + application.userName;
		application.status = 1;
		application.domain = domain + "-" + application.userName;
		delete application['memory'];
		node = processes.buildNext(node, {
			do: function* () {
				var self = this;
				var inserted = yield models.gospel_applications.modify({
					id: application.id,
					status: 1,
					domain: application.domain,
					docker: application.docker,
					sshPort: application.sshPort,
					port: application.port,
					password: application.password,
					socketPort: application.socketPort,
					dbPort: application.dbPort,
				});
				self.data = inserted;
				application = inserted;
				if (!inserted) {
					throw ('创建应用失败');
				}
			},
			data: application,
			undo: function* () {
				var self = this;
				console.log("undo application");
				yield models.gospel_applications.delete(self.data.id);
			},
		});
		var result = yield node.excute();
		return result;
	},
	//构建
	initDebug: function* (application) {

		//判断应用名是否为中文名，当为中文名时，获取中文拼音
		application = JSON.parse(application)
		console.log(application);
		var en_name = application.name.toLocaleLowerCase();
		console.log(en_name);
		var user = yield models.gospel_users.findById(application.creator);
		var reg = /[\u4e00-\u9FA5]+/;
		var res = reg.test(en_name);

		if (res) {
			var tr = transliteration.transliterate
			en_name = tr(en_name).replace(new RegExp(" ", 'gm'), "").toLocaleLowerCase();
		}
		//根据用户输入获取镜像名称

		application.image = application.languageType;
		//获取主机
		var host = user.host;

		console.log(host);
		if(application.git != null && application.git != undefined && application.git != ''){
			//用户创建应用的方式未从git创建时 git clone项目到平台
			shells.gitClone({
				host: host,
				user: application.creator,
				projectname: en_name + "_" + user.name,
				gitURL: application.git,
			});
		}
		var image = '';
		if(application.framework != null && application.framework != undefined && application.framework != ''){
			//初始化应用框架
			image = yield models.gospel_images.findById(application.framework);
		}else{
			image = yield models.gospel_images.findById(application.image);
		}
		console.log(image);
		application.cmds = image.cmds;
		application.exposePort = image.port;
		//端口生成
		application.port = yield portManager.generatePort(host);
		application.socketPort = yield portManager.generatePort(host);
		if (application.port == application.socketPort) {
			application.port = yield portManager.generatePort(host);
		}
		application.sshPort = yield portManager.generatePort(host);
		if (application.sshPort == application.socketPort) {

			application.socketPort = yield portManager.generatePort(host);
		}
		application.dbPort = yield portManager.generatePort(host);
		if(application.dbPort == application.socketPort || application.dbPort == application.sshPort || application.dbPort == application.port){
			application.dbPort = yield portManager.generatePort(host);
		}
		var result = yield shells.initDebug({
			host: host,
			name: en_name + "_" + user.name,
			sshPort: application.sshPort,
			socketPort: application.socketPort,
			appPort: application.port,
			password: application.password,
			image: image.id,
			framework: application.framework,
			hostName: en_name,
			exposePort: image.port,
			creator: application.creator,
			db: application.databaseType,
			dbUser: application.dbUser,
			version: application.languageVersion,
			dbPort: application.dbPort
		});
		console.log(result);
		if(application.git != null && application.git != undefined && application.git != ''){

			console.log("gen key");
			// //生成ssh key
			//  yield shells.sshKey({
			// 	host: host,
			// 	docker: en_name + "_" + user.name,
			// });
			// application.sshKey = yield shells.sshKey({
			// 	host: host,
			// 	docker: en_name + "_" + user.name,
			// });
		}
		if(application.framework != null && application.framework != undefined && application.framework != ''){
			yield shells.mvFiles({
				host: host,
				name: en_name + "_" + user.name,
			});
		}
		console.log(application);
		application.image = application.image + ":" + application.languageVersion;
		application.host = host;
		application.status = -1;
		application.docker = 'gospel_project_' + en_name + "_" + user.name;
		delete application['languageType'];
		delete application['languageVersion'];
		delete application['databaseType'];
		console.log(application);
		var inserted = yield models.gospel_applications.create(application);
		yield models.gospel_uistates.create({
			application: inserted.id,
			creator: application.creator,
			configs: image.defaultConfig
		});

		return inserted;
	},
	//根据用户的ide版本获取对应配置的主机
	hostFilter: function*(user, share) {
		console.log("hostFilter");
		var hosts = yield models.gospel_hosts.getAll({
			type: user.type,
			share: share
		})
		return selector.select(hosts);
	},
}
