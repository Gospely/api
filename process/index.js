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

	app_start: function*(application) {


		var domain = application.name;
		var user = yield models.gospel_users.findById(application.creator);
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
			},
			undo: function*() {

				var self = this;
				var name = self.data.domain.replace('-', '_')
				yield shells.delNginxConf({
					projectname: name
				});
				yield shells.nginx();
				console.log("undo domain");
			},
		});

		//docker 创建

		//var data = yield shells.nginx();
		// console.log(data);
		//创建并启动docker

		application.socketPort = yield portManager.generatePort();
		if (application.port == application.socketPort) {
			application.port = yield portManager.generatePort();
		}
		application.sshPort = yield portManager.generatePort();
		if (application.sshPort == application.socketPort) {

			application.socketPort = yield portManager.generatePort();
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
				var result = yield shells.docker(self.data);
				if (application.git) {
					console.log("gicone");
					shells.gitClone({
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
			undo: function*() {

				var self = this;
				yield shells.stopDocker({
					docker: self.data.name
				});
				yield shells.rmDocker({
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
	initDebug: function*(application) {

		var host = yield this.hostFilter(application.creator, true);


		// shells.gitClone({
		// 	user: application.creator,
		// 	projectname: domain + "_" + application.userName,
		// 	gitURL: application.git,
		// });
		console.log(host);
	},
	//根据用户的ide版本获取对应配置的主机
	hostFilter: function*(userId, share) {
		var user = yield models.gospel_users.findById(userId);
		console.log("hostFilter");
		var hosts = yield models.gospel_hosts.getAll({
			type: user.type,
			share: share
		})
		return selector.select(hosts);
	},
	imagesFilter: function() {

		return {
			nodejs: {
				latest: function() {
					return 'nodejs:latest'
				},
				'4.4.4': function() {
					return 'nodejs:4.4.4'
				}
			},
			php: {
				latest
			}
		}
	}
}
