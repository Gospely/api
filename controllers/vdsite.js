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
			exec('cp -r ' + __dirname + '/../tmp/vdsite/style ' + dir + '/' + zipFolder + ' && cd ' + dir + ' && zip -r ' + zipFolder + '.zip ' + zipFolder, function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},

	cp = function(dest, origin) {
		return new Promise(function(resolve, reject) {
			exec('cp -r ' + __dirname + '/../tmp/vdsite/' + dest + ' ' + origin , function(error, data) {
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

		console.log('=========================');

		console.log(app.css);

		console.log('=========================');

		this.body = util.resp(500, '云打包失败', '创建项目主文件夹失败');
	}
}

module.exports = vdsite;
