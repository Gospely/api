var util = require('../utils.js'),
	fs = require('fs'),
	path = require('path'),
	co = require('co'),
	parse = require('co-body'),
	url = require('url');

var os = require('os');
var exec = require('child_process').exec;
var dir = require('node-dir');

var 
	config = {
		baseDir: '/var/www/storage/codes/vue-f7/'
	},

	readFile = function (fileName){
	  return new Promise(function (resolve, reject){
	    fs.readFile(fileName, {flag: 'r+', encoding: 'utf8'}, function(error, data){
	      if (error) reject(error);
	      resolve(data);
	    });
	  });
	},

	writeFile = function(fileName, content) {
	  return new Promise(function (resolve, reject){
	    fs.writeFile(fileName, content, function(error){
	      if (error) {
	      	reject(error);
	      };
	      resolve();
	    });
	  });
	},

	appendFile = function(fileName, content) {
	  return new Promise(function (resolve, reject){
	    fs.appendFile(fileName, content, function(error, data){
	      if (error) reject(error);
	      resolve(data);
	    });
	  });
	},

	removeFile = function(fileName) {
		return new Promise(function (resolve, reject) {
			fs.unlink(fileName, function(error, data) {
				if(error) reject(error);
				resolve(data);
			});
		});
	},

	renameFile = function(fileName, newFileName) {
		return new Promise(function (resolve, reject) {
			fs.rename(fileName, newFileName, function(error, data) {
				if(error) reject(error);
				resolve(data);
			});
		});
	},

	mkdir = function(fileName) {
		return new Promise(function (resolve, reject) {
			fs.mkdir(fileName, function(error, data) {
				if(error) reject(error);
				resolve(data);
			});
		});
	},

	rmdir = function(dir) {
		return new Promise(function(resolve, reject) {
			exec('rm -rf ' + dir,function(error, data) { 
				if(error) reject(error);
				resolve(data);
			});
		});
	},

	listDir = function(dirName) {
		return new Promise(function(resolve, reject) {
			dir.paths(dirName, function(error, subdirs) {
				if(error) reject(error);
				resolve(subdirs);
			});
		});
	},

	GetQueryString = function(params, name) {
	    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	    var r = params.match(reg);
	    if(r!=null)return unescape(r[2]); return null;		
	}


os.platform() === 'darwin' ? 

	config.baseDir = '/var/www/apache/gospel/vue-f7/' : 
	config.baseDir = '/var/www/storage/codes/vue-f7/' ;

var fileSystem = {

	read: function* () {

		try {
			var fileContent = yield readFile(config.baseDir + this.params.fileName);
			this.body = util.resp(200, '读取成功', fileContent.toString());
		}catch(err) {
			this.body = util.resp(500, '读取失败', err.toString());
		}

	},

	write: function* () {

		var params = yield parse(this);

		var fileName = GetQueryString(params, 'fileName')
			data = GetQueryString(params, 'data');

		try {
			yield writeFile(config.baseDir + fileName, data);
			this.body = util.resp(200, '写入成功', {});
		}catch(err) {
			this.body = util.resp(500, '写入失败', err.toString());
		}

	},

	append: function* () {

		var params = yield parse(this);

		var fileName = GetQueryString(params, 'fileName')
			data = GetQueryString(params, 'data');

		try {
			yield appendFile(config.baseDir + fileName, data);
			this.body = util.resp(200, '追加成功', {});
		}catch(err) {
			this.body = util.resp(500, '追加失败', err.toString());
		}

	},

	remove: function* () {

		try {
			var fileContent = yield removeFile(config.baseDir + this.params.fileName);
			this.body = util.resp(200, '删除成功', this.params.fileName);
		}catch(err) {
			this.body = util.resp(500, '删除失败', err.toString());
		}

	},

	rename: function* () {

		var params = yield parse(this);

		var fileName = GetQueryString(params, 'fileName')
			newFileName = GetQueryString(params, 'newFileName');

		try {
			yield renameFile(config.baseDir + fileName, newFileName);
			this.body = util.resp(200, '重命名成功', {});
		}catch(err) {
			this.body = util.resp(500, '重命名失败', err.toString());
		}

	},

	copy: function* () {

	},

	mkdir: function* () {

		var params = yield parse(this);

		var dirName = GetQueryString(params, 'dirName');

		try {
			yield mkdir(config.baseDir + dirName);
			this.body = util.resp(200, '创建文件夹成功', dirName);
		}catch(err) {
			this.body = util.resp(500, '创建文件夹失败', err.toString());
		}

	},

	rmdir: function* () {

		var params = yield parse(this);

		var dirName = GetQueryString(params, 'dirName');

		try {
			yield rmdir(config.baseDir + dirName);
			this.body = util.resp(200, '删除文件夹成功', dirName);
		}catch(err) {
			this.body = util.resp(500, '删除文件夹失败', err.toString());
		}

	},

	copydir: function* () {

	},

	ls: function* () {

		try {
			var files = yield listDir(config.baseDir + 'src'),
				fileList = files.files,
				dirs = files.dirs;

			var result = [];

			for (var i = 0; i < dirs.length; i++) {

				var dir = dirs[i];
				var tree = {};

				var dirSplit = dir.split('/'),
					dirName = dirSplit[dirSplit.length - 1];

				tree[dir] = {
					isDir: true,
					name: dirName,
					sub: []
				};

				for (var j = 0; j < fileList.length; j++) {
					var file = fileList[j];

					if(file.indexOf(dir) != -1) {

						var fileSplit = file.split('/'),
							fileName = fileSplit[fileSplit.length - 1];

						tree[dir].sub.push({
							path: file,
							name: fileName,
							isDir: false
						});
					}
				};

				result.push(tree);

			};

			this.body = util.resp(200, '读取文件夹成功' + os.platform(), result);
		}catch(err) {
			this.body = util.resp(500, '读取文件夹失败' + os.platform(), err.toString());
		}

	}
};


module.exports = fileSystem;
