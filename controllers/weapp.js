var util = require('../utils.js'),
	fs = require('fs'),
	path = require('path'),
	co = require('co'),
	parse = require('co-body'),
	url = require('url');

var send = require('koa-send');
var os = require('os');
var exec = require('child_process').exec;
var dir = require('node-dir');
var multer = require('koa-multer');
var path = require('path');
var shells = require('../shell/index');

var	writeFile = function(fileName, content) {
		return new Promise(function(resolve, reject) {
			fs.writeFile(fileName, content, function(error) {
				if (error) {
					reject(error);
				};
				resolve();
			});
		});
	},

	mkdir = function(fileName) {
		return new Promise(function(resolve, reject) {
			exec('mkdir ' + fileName, function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},

	rmdir = function(dir) {
		return new Promise(function(resolve, reject) {
			exec('rm -rf ' + dir, function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},

var weapp = {
	pack: function*() {

		var app = yield parse(this);

		if(typeof app == 'string') {
			app = JSON.parse(app);
		}

		var randomDir = __dirname + randomString(8, 10);

		var loopPack = function(dir) {

			try {
				mkdir(dir);

				for(var key in app) {
					var val = app[key],
						filePath = '',
					try {

						if(typeof val == 'string') {

							try {
								filePath = dir + key;
								yield writeFile(filePath, val);
							}catch (err) {
								rmdir(dir);
								this.body = util.resp(500, '云打包失败', '创建文件: ' + key + '失败：' + err.toString());
							}
						}else {

						}

					} catch (err) {
						rmdir(dir);
						this.body = util.resp(500, '云打包失败', '创建文件夹失败：' + err.toString());
					}

				}

			}catch (err) {
				this.body = util.resp(500, '云打包失败', '创建项目主文件夹失败：' + err.toString());
			}

		}

		loopPack(randomDir);

	}
}

export default weapp;
