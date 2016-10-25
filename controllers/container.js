var exec = require('child_process').exec,
	baseCMD = 'ssh root@120.76.235.234 ',
	parse = require('co-body'),
	util = require('../utils.js');

var execCMD = function(cmd) {
	return new Promise(function(resolve, reject) {
		exec(baseCMD + cmd, function(error, data) {
			if(error) reject(error);
			resolve(data);
		});
	});
}

var container = {

	start: function* () {

		var name = parse(this);

		console.log(name);

		try {
			yield execCMD('docker start ' + name.name);
			this.body = util.resp(200, '启动成功', name);
		}catch(err) {
			this.body = util.resp(500, '启动失败', err.toString());
		}
	},

	stop: function* () {

		var name = parse(this);

		try {
			yield execCMD('docker stop ' + name.name);
			this.body = util.resp(200, '停止成功', name);
		}catch(err) {
			this.body = util.resp(500, '停止失败', err.toString());
		}
	},

	restart: function* () {
		var name = parse(this);

		console.log(name, this.req);

		try {
			yield execCMD('docker restart ' + name.name);
			this.body = util.resp(200, '重启成功', name);
		}catch(err) {
			this.body = util.resp(500, '重启失败', err.toString());
		}
	},

	inspect: function* () {
		var containerName = this.params.containerName;

		try {
			var info = yield execCMD('docker inspect ' + containerName);
			this.body = util.resp(200, '查看容器基本信息成功', info);
		}catch(err) {
			this.body = util.resp(500, '查看容器基本信息失败', err.toString());
		}

	}

}

module.exports = container;