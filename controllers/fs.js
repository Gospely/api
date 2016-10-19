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

			console.log(fileName, newFileName);

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

	readDir = function(dirName) {
		return new Promise(function(resolve, reject) {
			fs.readdir(dirName, function(error, data) {
				if(error) reject(error);
				resolve(data);
			});
		});
	},

	exists = function(path){
	    return fs.existsSync(path);
	},

	isDir = function(path){  
        return exists(path) && fs.statSync(path).isDirectory();  
    },

	cp = function(file, newFile) {
		return new Promise(function(resolve, reject) {
			var cmd = 'cp -r ' + file + ' ' + newFile;
			exec(cmd, function(error, data) {
				if(error) reject(error);
				resolve(data);
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

		try {
			var fileName = params.fileName,
				newFileName = params.newFileName;		
		}catch(err) {
			var fileName = GetQueryString(params, 'fileName')
				newFileName = GetQueryString(params, 'newFileName');
		}

		try {
			yield renameFile(config.baseDir + fileName, config.baseDir + newFileName);
			this.body = util.resp(200, '重命名成功', {id: newFileName});
		}catch(err) {
			this.body = util.resp(500, '重命名失败', err.toString());
		}

	},

	copy: function* () {

		var params = yield parse(this);

		var file = GetQueryString(params, 'file')
			newFile = GetQueryString(params, 'newFile');

		try {
			yield cp(config.baseDir + file, config.baseDir + newFile);
			this.body = util.resp(200, '复制成功', {});
		}catch(err) {
			this.body = util.resp(200, '复制失败', err.toString());
		}

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

	list: function* () {

		var dirName = this.params.dirName || '',
			result = [];

		dirName = this.query.id || dirName;

		var files = yield readDir(config.baseDir + dirName);

		if(dirName == '') {

			var node = {
				text: 'root',
				children: [],
				id: config.baseDir,
				icon: 'folder',
				state: {
					opened: true,
					disabled: true
				}
			}

			for (var i = 0; i < files.length; i++) {
				var file = files[i];

				if(isDir(config.baseDir + file)) {
					node.children.push({
						text: file,
						children: true,
						id: file,
						icon: 'folder',
						folder: dirName
					});
				}else {
					node.children.push({
						text: file,
						children: false,
						id: file,
						icon: 'file file-11',
						folder: dirName
					});
				}

			};

			result.push(node);

		}else {

			for (var i = 0; i < files.length; i++) {
				var file = files[i];

				var node = {};

				if(file == 'models') {
					console.log(isDir(config.baseDir + file), config.baseDir + file);
				}

				if(isDir(config.baseDir + dirName + '/' + file)) {
					node = {
						text: file,
						id: dirName + '/' + file,
						icon: 'folder',
						children: true,
						folder: dirName + '/'
					};
				}else {
					node = {
						text: file,
						id: dirName + '/' + file,
						icon: 'file',
						type: 'file file-11',
						children: false,
						folder: dirName + '/'
					};
				}

				result.push(node);
			};

		}

		this.body = result;

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

				tree = {
					isDir: true,
					name: dirName,
					sub: [],
					id: i + 1,
					path: dir
				};

				for (var j = 0; j < fileList.length; j++) {
					var file = fileList[j];

					if(file.indexOf(dir) != -1) {

						var fileSplit = file.split('/'),
							fileName = fileSplit[fileSplit.length - 1];

						tree.sub.push({
							path: file,
							name: fileName,
							isDir: false,
							pId: i + 1,
							id: (i + 1) * j
						});
					}
				};

				result.push(tree);

			};

			this.body = util.resp(200, '读取文件夹成功', result);
		}catch(err) {
			this.body = util.resp(500, '读取文件夹失败', err.toString());
		}

	}
};


module.exports = fileSystem;
