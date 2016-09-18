var util = require('../utils.js');
var models = require('../models');

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
  var user = yield models.User.findById('1');
  if (!user) this.throw(404, 'invalid user id');
  this.body = yield render(user);
}

/**
 * 删除
 */
users.remove = function *remove(id) {
    var user = todos[id];
    if (!user) this.throw(404, 'invalid user id');
   todos.splice(id,1);
    //Changing the Id for working with index
    for (var i = 0; i < todos.length; i++)
    {
        todos[i].id=i;
    }
    this.redirect('/');
}


module.exports = users;
