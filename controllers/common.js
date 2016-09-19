var util = require('../utils.js');
var models = require('../models');
var parse = require('co-body');
var co = require('co');

var common = {};

function render(data) {

	return {
		code: '1',
		message: '',
		fields: data
	}
}

function getModel(ctx) {
  var modelsName = "gospel_" + ctx.url.split("/")[1];
  return modelsName;
}
common.list= function *list() {


    var data = yield models[getModel(this)].findAll();
    this.body = yield  render(data);
}

common.detail = function *detail(id) {

    var id = this.params.id;
    var data = yield models[getModel(this)].findById(id);
    this.body = yield render(data);
}

common.update = function *update() {

    console.log("update");
  	if ('PUT' != this.method) return yield next;
  	  var item = yield parse(this, {
  	    limit: '1kb'
  	  });
  		console.log(item);
  	  var inserted = yield models[getModel(this)].update(item);
  	  if (!inserted) {
  	    this.throw(405, "couldn't be added.");
  	  }
  	  this.body = 'Done!';
}

common.create = function *create() {

	console.log("create");
  	console.log(this);
	if ('POST' != this.method) return yield next;
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

common.delete = function *remove() {

		var id = this.params.id;
		console.log(id);

	  var deleted = models[getModel(this)].delete(id);

		if (!deleted) {
			this.throw(405, "couldn't be delete.");
		}
		this.body = 'Done!';
}
common.render = render;
module.exports = common;
