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

	zip = function(dir) {
		return new Promise(function(resolve, reject) {
			dir = dir.split('/');
			var zipFolder = dir.pop();
			dir = dir.join('/');
			exec('cp -r ' + __dirname + '/../tmp/weui/style ' + dir + '/' + zipFolder + ' && cd ' + dir + ' && zip -r ' + zipFolder + '.zip ' + zipFolder, function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},

	beautifyJS = function(fileName, type) {
		return new Promise(function(resolve, reject) {
			exec('js-beautify --type ' + type +' ' + fileName + ' -r', function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	}

var weapp = {
	pack: function*() {

		var app = yield parse(this);

		if(typeof app == 'string') {
			app = JSON.parse(app);
		}

		var randomDir = __dirname + '/../tmp/'+  util.randomString(8, 10) + '/';

		var loopPack = function *(dir, app) {

			try {

				yield mkdir(dir);

				for(var key in app) {
					var file = app[key],
						filePath = '';

					try {

						if(typeof file == 'string') {

							try {
								filePath = dir + key;
								yield writeFile(filePath, file);

								var splitKey = key.split('.'),
									extension = splitKey.pop();

								var type = '';

								if(extension == 'js' || extension == 'json') {
									type = 'js';
								}

								if(extension == 'wxss') {
									type = 'css';	
								}

								if(extension == 'wxml') {
									type = 'html';
								}

								yield beautifyJS(filePath, type);
							}catch (err) {
								this.body = util.resp(500, '云打包失败', '创建文件: ' + key + '失败：' + err.toString());
							}
						}else {
							yield loopPack(dir + key + '/', file);
						}

					} catch (err) {
						this.body = util.resp(500, '云打包失败', '创建文件夹失败：' + err.toString());
					}

				}

			}catch (err) {
				this.body = util.resp(500, '云打包失败', '创建项目主文件夹失败：' + err.toString());
			}

		}

		yield loopPack(randomDir, app);

		try {

			var dir = randomDir.split('/');
			dir.pop();
			dir = dir.join('/');

			yield zip(dir);
			rmdir(randomDir);
			this.body = util.resp(200, '云打包成功', dir + '.zip');
		} catch (err) {
			yield rmdir(randomDir);
			this.body = util.resp(500, '云打包失败', '压缩文件包失败：' + err.toString());
		}

	},

	download: function *() {
		this.body = 'Try GET /' + this.params.id;
	  	yield send(this, this.params.id, {
	  		root: __dirname + '/../tmp/'
	  	});
	}
}

module.exports = weapp;
