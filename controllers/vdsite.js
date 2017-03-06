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

var baseDir = '/var/www/storage/codes/'

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
			exec('cd ' + dir + ' && zip -r ' + zipFolder + '.zip ' + zipFolder, function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},

	cp = function(dest, origin) {
		return new Promise(function(resolve, reject) {
			exec('cp -r '+ origin + ' ' + dest , function(error, data) {
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

var vdsite = {
	pack: function *() {

		var app = yield parse(this);

		if(typeof app == 'string') {
			app = JSON.parse(app);
		}
		//创建文件夹，随机字符串

		var randomDir = baseDir;
		// 递归生成项目文件
		var loopPack = function *(dir, app) {
				if(dir!=randomDir ) {
					yield mkdir(dir);
				}
					for(var key in app) {
						var file = app[key],
						filePath = '';
						try {

							if(typeof file == 'string') {
								try {
									var type = '';

									if(key == 'css') {
										var Dir = dir + 'css/styles.css';
										yield writeFile(Dir, file);
										type ='css';
										yield beautifyJS(Dir, type);
									}
									else {
										filePath = dir + key;
										yield writeFile(filePath, file);

										var splitKey = key.split('.'),
											extension = splitKey.pop();

										if(extension == 'html') {
											type = 'html';

										}
										yield beautifyJS(filePath, type);
									}
								}catch (err) {
									this.body = util.resp(500, '云打包失败', '创建文件：' + key + '失败: ' + err.toString());
								}
							}
							else {
								yield loopPack(dir + key + '/', file);
							}
						}catch (err) {
							this.body = util.resp(500, '云打包失败', '创建文件夹失败: ' + err.toString());
						}
					}
		}
		try{
			yield loopPack(randomDir,app);
		} catch (err) {
			console.log(err.toString());
		}
		//将pages里面的文件复制出来
		// try {
		// 	yield cp ( randomDir, randomDir + 'pages/*');
		// 	yield rmdir( randomDir + 'pages');
		// }catch (err) {
		// 	console.log( err.toString());
		// 	this.body = util.resp(500, '复制失败' + err.toString());
		// }
		// try {
		//
		// 	var dir = randomDir.split('/');
		// 	dir.pop();
		// 	dir = dir.join('/');
		// 	console.log(dir);
		// 	yield zip(dir);
		// 	yield rmdir(randomDir);
		// 	this.body = util.resp(200, '云打包成功', dir + '.zip');
		// }catch (err) {
		// 	yield rmdir(randomDir);
		// 	console.log(err.toString());
		// 	this.body = util.resp(500, '云打包失败', '压缩文件包失败:' + err.toString());
		// }
	},

	download: function *() {
		this.body = 'Try GET /' + this.params.id;
		yield send(this, this.params.id, {
			root: __dirname + '/../tmp/vdsite'
		});
	}
}

module.exports = vdsite;
