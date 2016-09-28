var util = require('../utils.js');
var models = require('../models');
var parse = require('co-body');
var md5_f = require('../utils/MD5');
var common = {};

//数据渲染，todo:分页参数引入，异常信息引入
function render(data) {

	return {
		code: '1',
		message: '',
		fields: data
	}
}

//根据请求url隐射到对应的Model，todo:实现方式简单粗暴，对命名约束要求高
function getModel(ctx) {
  var modelsName = "gospel_" + ctx.url.split("?")[0].split("/")[1];
  return modelsName;
}

//获取Model的数据列表, todo:过滤参数动态引入
common.list= function *list() {
	if ('GET' != this.method) this.throw(405, "method is not allowed");
    var data = yield models[getModel(this)].getAll(this.query);
    this.body = yield  render(data);
}

//获取某条数据的详情
common.detail = function *detail(id) {

    var id = this.params.id;
    var data = yield models[getModel(this)].findById(id);
    this.body = yield render(data);
}

//更新某条记录
common.update = function *update() {

    console.log("update");
  	if ('PUT' != this.method) this.throw(405, "method is not allowed");
  	  var item = yield parse(this, {
  	    limit: '1kb'
  	  });
			if(item.password != null && item.password != undefined && item.password != ''){
					item.password = md5_f.md5Sign(item.password);
			}
      if(item.id == null || item.id == undefined) this.throw(405, "method is not allowed");

  	  var inserted = yield models[getModel(this)].modify(item);
  	  if (!inserted) {
  	    this.throw(405, "couldn't be added.");
  	  }
  	  this.body = 'Done!';
}

//新增一条记录
common.create = function *create() {

	console.log("create");
  	console.log(this);
	if ('POST' != this.method) this.throw(405, "method is not allowed");
	  var item = yield parse(this, {
	    limit: '1kb'
	  });
		console.log(item);
	  var inserted = yield models[getModel(this)].create(item);
	  if (!inserted) {
	    this.throw(405, "couldn't be added.");
	  }
	  this.body = 'Done!';
}

//根据主键删除一条记录
common.delete = function *remove() {

		var id = this.params.id;
		console.log(id);

	  var deleted = yield models[getModel(this)].delete(id);
    console.log(deleted);
		if (!deleted) {
			this.throw(405, "couldn't be delete.");
		}
		this.body = 'Done!';
}

common.render = render;
common.models = models;

module.exports = common;
