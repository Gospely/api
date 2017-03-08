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
			fs.mkdir(fileName, function(error, data) {
				if (error) {
					if (error.code == 'EEXIST') {
						resolve(data);
					}else {
						reject(error);
					}
				}
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
				console.log(error);
				console.log(data);
				if (error) reject(error);
				resolve(data);
			});
		});
	},

	cp = function(dest, origin) {
		return new Promise(function(resolve, reject) {
			exec('cp -fr '+ origin + ' ' + dest , function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},
	mv = function(origin, dest) {
		return new Promise(function(resolve, reject) {
			exec('mv  '+ origin + ' ' + dest , function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},
	rmFile =function(fileName){
	    return new Promise(function(resolve, reject) {
	        exec("rm -rf " + fileName, function(err, data) {
	                console.log(data);
	                console.log(err);
	                if (err) reject(err);
	                resolve(data);
	            });
	    })
	},
	readData = function (path){
	    return new Promise(function(resolve,reject){
	        fs.readFile(path,function(err,data){
	            if(err){
	                reject(err);//文件存在返回true
	            }else{
	                resolve(data);//文件不存在，这里会抛出异常
	            }
	        });
	    }).then(function(data){
	            console.log(data);
	            return data;
	        },function(err){
	            console.log(err);
	            return err;
	        });
	},

	beautifyJS = function(fileName, type) {
		return new Promise(function(resolve, reject) {
			exec('js-beautify --type ' + type +' ' + fileName + ' -r', function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},
	pageGenerator = function*(ctx, isBeautify){

		var app = yield parse(ctx);

		if(typeof app == 'string') {
			app = JSON.parse(app);
		}
		if(app.isBeautify){
			isBeautify = app.isBeautify;
			delete app['isBeautify'];
		}
		//创建文件夹，随机字符串

		var randomDir = baseDir + app.folder,
			stylesName = 'styles.'+ util.randomString(8, 10) + '.css';
			scriptsName = 'main.' + util.randomString(8, 10) + '.js';
		delete app['folder'];

		yield rmFile(randomDir + 'pages/css/styles.*');
		yield rmFile(randomDir + 'pages/js/main.*')
		yield cp(randomDir + 'pages/', randomDir + 'vendor');

		var loopPack = function *(dir, app) {
			if(dir!=randomDir ) {
				var data = yield mkdir(dir);
			}
			for(var key in app) {
				var file = app[key],
				filePath = '';
				try {

					if(typeof file == 'string') {
						try {

							if(key == 'css') {

								var Dir = dir + 'pages/css/' + stylesName;
								yield writeFile(Dir, file);
								type ='css';
								if(isBeautify){
									yield beautifyJS(Dir, 'css');
								}
							}else if(key == 'scripts') {
								var Dir = dir + 'pages/js/' + scriptsName;
								yield writeFile(Dir, file);
								if(isBeautify){
									yield beautifyJS(Dir, 'js');
								}
							}else {
								filePath = dir + key;
								var splitKey = key.split('.'),
									extension = splitKey.pop();

								if(extension == 'html') {
									file = file.replace(/styles.css/, stylesName);
									file = file.replace(/main.js/, scriptsName);
								}
								yield writeFile(filePath, file);
								if(isBeautify) {
									yield beautifyJS(filePath, 'html');
								}
							}
						}catch (err) {
							ctx.body = util.resp(500, '云打包失败', '创建文件：' + key + '失败: ' + err.toString());
						}
					}else {
						yield loopPack(dir + key + '/', file);
					}
				}catch (err) {
					ctx.body = util.resp(500, '云打包失败', '创建文件夹失败: ' + err.toString());
				}
			}
		}
		try{
			yield loopPack(randomDir,app);
			ctx.body = util.resp(200, '配置预览环境成功', '');
		} catch (err) {
			console.log(err.toString());
			ctx.body = util.resp(500, '云打包失败', '压缩文件包失败:' + err.toString());
		}
	}
var vdsite = {
	pack: function *() {
		yield pageGenerator(this, false);
	},

	download: function *() {

		try {
			var folder = this.query.folder;
			var project = this.query.project
			var randomDir = baseDir + folder + project;
			console.log(randomDir);
			yield cp(randomDir, baseDir + folder + 'pages');
			yield cp(randomDir, baseDir + folder + 'images');
			yield zip(randomDir);
			// yield mv(baseDir + folder + 'pages.zip', baseDir + folder + project + '.zip')
			this.set('Content-disposition','attachment;filename='+ project +'.zip');
			var info = yield readData(randomDir +'.zip');
			this.body = info;
			yield rmFile(randomDir);
			yield rmFile(randomDir + '.zip');
		}catch (err) {
			console.log(err);
			this.body = util.resp(200, '云打包成功'+ err.toString());
		}
	},
	deploy: function*(){
		//发布逻辑
		var folder = this.query.folder;
		var randomDir = baseDir + folder + 'pages/*';
		yield cp(baseDir + folder, randomDir);
		this.body = util.resp(200, '发布成功');
	}
}

module.exports = vdsite;
