var util = require('../utils.js'),
	fs = require('fs'),
	path = require('path');

var fileSystem = {};

fileSystem.baseDir = '/var/www/storage/codes/vue-f7/';

fileSystem.read =  function* (){

	// fs.readFile();

	console.log("tests");
	this.body = 'fuck';
	// util.resp(100, 'fuck', fileSystem);

}
module.exports = fileSystem;
