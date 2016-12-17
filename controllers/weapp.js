var util = require('../utils.js'),
	fs = require('fs'),
	path = require('path'),
	co = require('co'),
	parse = require('co-body'),
	url = require('url');

var os = require('os');
var exec = require('child_process').exec;
var dir = require('node-dir');
var multer = require('koa-multer');
var path = require('path');
var shells = require('../shell/index');

var weapp = {
	pack: function() {

		this.body = util.resp(200, '访问成功', '云打包');
	}
}

export default weapp;
