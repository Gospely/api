var util = require('../utils.js'),
	fs = require('fs'),
	path = require('path'),
	co = require('co');

var fileSystem = {};

var config = {
	baseDir: '/var/www/storage/codes/vue-f7/'
};

process.platform === 'darwin' ? 
	config.baseDir = '/var/www/apache/gospel/vue-f7' : 
	config.baseDir = '/var/www/storage/codes/vue-f7'

fileSystem.read = function* (){

	var self = this;

	var readFile = function (fileName){
	  return new Promise(function (resolve, reject){
	    fs.readFile(fileName, {flag: 'r+', encoding: 'utf8'}, function(error, data){
	      if (error) reject(error);
	      resolve(data);
	    });
	  });
	};

	try {
		var fileContent = yield readFile(config.baseDir + '/index.html');
		self.body = util.resp(200, '读取成功', fileContent.toString());
	}catch(err) {
		self.body = util.resp(500, '读取失败', err);
	}


}
module.exports = fileSystem;
