var util = require('../utils.js');
var models = require('../models');
var parse = require('co-body');
var co = require('co');

var users = {};

function render(data) {

	return {
		code: '1',
		message: '',
		data: data
	}
}


/**
 * 获取所有
 */
users.list=function *list() {

  var users = yield models.gospel_users.getAll();
  this.body = yield  render(users);
}

/**
 * 根据id获取某一个
 */
users.show =function *show(id) {
  var user = yield models.gospel_users.findById('1');
  if (!user) this.throw(404, 'invalid user id');
  this.body = yield render(user);
}

users.create = function *create() {
	console.log("test");
	if ('POST' != this.method) return yield next;
	  var user = yield parse(this, {
	    limit: '1kb'
	  });
		console.log(user);
	  var inserted = yield models.gospel_users.create(user);
	  if (!inserted) {
	    this.throw(405, "The book couldn't be added.");
	  }
	  this.body = 'Done!';

}

/**
 * 删除
 */
users.remove = function *remove(id) {

		console.log("remove id:"+id);
  	if("DELETE" != this.method) return yield next;

		  var deleted = models.gospel_users.delete(id);

			if (!deleted) {
				this.throw(405, "The book couldn't be added.");
			}
			this.body = 'Done!';
}
module.exports = users;
