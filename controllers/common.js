var util = require('../utils.js');
var models = require('../models');
var reader = require('../utils/reader');
var parse = require('co-body');
var md5_f = require('../utils/MD5');
var common = {};

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

//根据请求url隐射到对应的Model，todo:实现方式简单粗暴，对命名约束要求高
function getModel(ctx) {
	var modelsName = "gospel_" + ctx.url.split("?")[0].split("/")[1];
	return modelsName;
}

//获取Model的数据列表, todo:过滤参数动态引入
common.list = function* list(next) {


	if ('GET' != this.method) this.throw(405, "method is not allowed");

	var limit = this.query.limit;
	var cur = this.query.cur;
	console.log(this.query);
	var cur = this.query.cur;
	var data = yield models[getModel(this)].getAll(this.query);
	var count = yield models[getModel(this)].count(this.query);
	var total = 0;
	if (count[0].dataValues == undefined) {
		total = count[0].all;
		console.log("total" + total);
	} else {
		total = count[0].dataValues.all;
	}
	var page = total % limit == 0 ? total / limit : Math.ceil(total / limit);

	if (this.query.cur == null || this.query.cur == '' || this.query.cur ==
		undefined) {
		cur = 1;
	}
	this.body = render(data, page, cur, 1);
}

//获取某条数据的详情
common.detail = function* detail(id) {

	var id = this.params.id;
	var data = yield models[getModel(this)].findById(id);
	this.body = render(data, null, null, 1);
}

//更新某条记录
common.update = function* update() {

	if ('PUT' != this.method) this.throw(405, "method is not allowed");
	var item = yield parse(this, {
		limit: '4048kb'
	});
	if (item.password != null && item.password != undefined && item.password !=
		'') {
		item.password = md5_f.md5Sign(item.password, "gospel_users");
	}
	if (item.id == null || item.id == undefined) this.throw(405,
		"method is not allowed");

	var inserted = yield models[getModel(this)].modify(item);
	if (!inserted) {
		this.throw(405, "couldn't be added.");
	}
	this.body = render(inserted, null, null, 2);
}

//新增一条记录
common.create = function* create() {

	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var item = yield parse(this, {
		limit: '1kb'
	});
	var data = yield models[getModel(this)].getAll(item);

	if (data.length > 0) {
		this.body = render(null, null, null, -1, '该数据已存在');
	} else {
		var inserted = yield models[getModel(this)].create(item);
		if (!inserted) {
			this.throw(405, "couldn't be added.");
		}
		this.body = render(inserted, null, null, 1, '新增成功');
	}
}

//根据主键删除一条记录
common.delete = function* remove() {

	var id = this.params.id;

	var deleted = yield models[getModel(this)].delete(id);
	if (!deleted) {
		this.throw(405, "couldn't be delete.");
	}
	this.body = render(deleted, null, null, 4, '删除成功');
}
common.count = function* count() {

	var count = yield models[getModel(this)].count(this.query);
	var total = count[0].dataValues.all;
	this.body = render(total, null, null, 1);
}
common.render = render;
common.models = models;

reader.readDir(__dirname).map(function(file) {

	var modelsName = file.split(".")[0];
	if (modelsName != "common" && modelsName != "index" && modelsName != "fs") {
		var controller = require('./' + modelsName);
		if (modelsName == 'domains') {
		}
		common[modelsName] = controller;
	}
});

module.exports = common;
