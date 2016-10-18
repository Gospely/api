var util = require('../utils.js'),
	fs = require('fs'),
	path = require('path'),
	co = require('co'),
	parse = require('co-body'),
	url = require('url');

var fileSystem = {};

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
	}

function GetQueryString(params, name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = params.match(reg);
    if(r!=null)return unescape(r[2]); return null;
}

process.platform === 'darwin' ? 

	config.baseDir = '/var/www/apache/gospel/vue-f7/' : 
	config.baseDir = '/var/www/storage/codes/vue-f7/' ;

fileSystem.read = function* (){

	try {
		var fileContent = yield readFile(config.baseDir + this.params.fileName);
		self.body = util.resp(200, '读取成功', fileContent.toString());
	}catch(err) {
		self.body = util.resp(500, '读取失败', err.toString());
	}

};

fileSystem.write = function* () {

	var params = yield parse(this);

	var fileName = GetQueryString(params, 'fileName')
		data = GetQueryString(params, 'data');

	try {
		yield writeFile(config.baseDir + fileName, data);
		this.body = util.resp(200, '写入成功', {});
	}catch(err) {
		this.body = util.resp(500, '写入失败', err.toString());
	}

};

fileSystem.append = function* () {

	var params = yield parse(this);

	var fileName = GetQueryString(params, 'fileName')
		data = GetQueryString(params, 'data');

	try {
		yield appendFile(config.baseDir + fileName, data);
		this.body = util.resp(200, '追加成功', {});
	}catch(err) {
		this.body = util.resp(500, '追加失败', err.toString());
	}

}


module.exports = fileSystem;
