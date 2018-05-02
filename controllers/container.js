var shell = require('../shell');
var exec = require('child_process').exec,
	remoteIp = ''
	baseCMD = 'ssh root@' + remoteIp + ' ',
	parse = require('co-body'),
	util = require('../utils.js'),
	request = require('request');

var execCMD = function(cmd, host) {

		remoteIp = host || '120.79.150.56';
		baseCMD = 'ssh root@' +  remoteIp;
		return new Promise(function(resolve, reject) {
			exec(baseCMD + cmd, function(error, data) {
				if(error) reject(error);
				resolve(data);
			});
		});
	},

	dockerStats = function(containerName, host) {

		remoteIp = host || '120.79.150.56';
		return new Promise(function(resolve, reject) {
			request.get({url:
					'http://' + remoteIp + ':2375/containers/' + containerName + '/stats?stream=0'
				},
			    function(error, response, body){
			        if(error) reject(error);
			        resolve(response, body);
			    }
			);
		});
	};

var container = {

	start: function* () {
		try {
			yield execCMD('docker start ' + this.containerName, this.remoteIp);

			if(this.image != 'vd:site'){
				shell.startTerminal({
					host: this.remoteIp,
					docker: this.containerName
				});
			}
			this.body = util.resp(200, '启动成功', this.containerName);
		}catch(err) {
			this.body = util.resp(500, '启动失败', err.toString());
		}
	},

	stop: function* () {
		try {

			yield execCMD('docker stop ' + this.containerName, this.remoteIp);
			this.body = util.resp(200, '停止成功', this.containerName);
		}catch(err) {
			this.body = util.resp(500, '停止失败', err.toString());
		}
	},

	restart: function* () {
		try {
			yield execCMD('docker restart ' + this.containerName, this.remoteIp);
			this.body = util.resp(200, '重启成功', this.containerName);
		}catch(err) {
			this.body = util.resp(500, '重启失败', err.toString());
		}
	},

	inspect: function* () {

		var containerName = this.containerName;

		try {
			var info = yield execCMD('docker inspect ' + containerName, this.remoteIp);
			this.body = util.resp(200, '查看容器基本信息成功', info);
		}catch(err) {
			this.body = util.resp(500, '查看容器基本信息失败', err.toString());
		}

	},

	stats: function* () {
		var containerName = this.containerName;

		try {
			var info = yield dockerStats(containerName, this.remoteIp);
			this.body = util.resp(200, '监控容器运行状态成功', info.body);
		}catch(err) {
			this.body = util.resp(500, '监控容器运行状态失败', err.toString());
		}

	}
}

module.exports = container;
