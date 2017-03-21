
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

var baseDir = '/var/www/storage/codes/';
var models = require('../models');
//数据渲染，todo:分页参数引入，异常信息引入
function render(data, all, cur, code, message) {

	return {
		code: code,
		message: message,
		all: all,
		cur: cur,
		fields: data
	}
}
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

		var app = yield parse(ctx,{
				limit: '30960kb'
		});

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
		yield rmFile(randomDir + 'pages/js/main.*');
		yield rmFile(randomDir + 'js/main.*');
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
								file = file.replace('undefined', '');
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

		//计算打包次数
		// var app = yield parse(this);
		// if(typeof app == 'string') {
		// 	app = JSON.parse(app);
		// }
		// var user = app.folder.split('/')[0];
		// var data = yield models.gospel_counts.getAll({
		// 	userId: user
		// });
		// console.log(data);
		//
		// if (data.length !=1) {
		// 	var inserted = yield models.gospel_counts.create({
		// 		userId: user,
		// 		packCount: 1
		// 	});
		// } else {
		// 	var packCount = data[0].dataValues.packCount;
		// 	var modify = yield models.gospel_counts.modify({
		// 		userId: user,
		// 		packCount: packCount+1
		// 	});
		// }
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
			this.set('Content-disposition','attachment;filename='+ encodeURI(project) +'.zip');
			var info = yield readData(randomDir +'.zip');
			this.body = info;
			yield rmFile(randomDir);
			yield rmFile(randomDir + '.zip');
		}catch (err) {
			console.log(err);
			this.body = util.resp(200, '云打包成功'+ err.toString());
		}

		//计算下载的次数
		// var user =  this.query.folder.split('/')[0];
		// var data = yield models.gospel_counts.getAll({
		// 	userId: user
		// });
		//
		// if (data.length !=1) {
		// 	var inserted = yield models.gospel_counts.create({
		// 		userId: user,
		// 		downloadCount: 1
		// 	});
		// 	if(!inserted) {
		// 		this.throw(405, "不能被成功添加");
		// 	}
		// 	this.body = render(inserted, 1, '新增成功');
		// } else {
		// 	var downloadCount = data[0].dataValues.downloadCount;
		// 	var modify = yield models.gospel_counts.modify({
		// 		userId: user,
		// 		downloadCount: downloadCount+1
		// 	});
		// 	if(!modify) {
		// 		this.throw(405, "不能修改次数");
		// 	}
		// }

	},
	deploy: function*(){
		//发布逻辑
		var folder = this.query.folder;
		var randomDir = baseDir + folder + 'pages/*';
		yield cp(baseDir + folder, randomDir);
		this.body = util.resp(200, '发布成功');
	},
	template: function*(){

		var app = yield parse(this,{
				limit: '30960kb'
		});
		console.log(app);
		var creator = app.creator || 'admin',
			type = app.type || 'office',
			name = app.name || 'template',
			url = app.url || '';
			application = app.application;
		if(typeof app == 'string') {
			app = JSON.parse(app);
		}
		console.log(app);
		var data = yield models.gospel_templates.getAll({
			application: app.application
		})
		delete app['creator'];
		delete app['type'];
		delete app['name'];
		delete app['application'];
		delete app['url'];

		if(data.length > 0){
			yield models.gospel_templates.modify({
				name: name,
				id: data[0].dataValues.id,
				content: JSON.stringify(app),
			})
		}else {
			yield models.gospel_templates.create({
				name: name,
				creator: creator,
				type: type,
				application: application,
				content: JSON.stringify(app)
			})
		}

		this.body = util.resp(200, '保存成功');
	},
	getTemplate: function*(){

		var data = yield models.gospel_templates.getAll({
			application: this.query.application
		})
		this.body =  render(data, null, null, 1, "");
	}
}

module.exports = vdsite;
