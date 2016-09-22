var util = require('../utils.js');
var models =require('../models');
var md5_f = require('../utils/MD5');
var parse = require('co-body');
var users = {};


users.login = function* (){

  if ('POST' != this.method) this.throw(405, "method is not allowed");
  var user = yield parse(this, {
    limit: '1kb'
  });
  user.password = md5_f.md5Sign(user.password,'gospel_users');
  var data = yield models.gospel_users.findAll({where: user});
  if(data == null|| data == undefined || data.length != 1){
    this.throw(405, "couldn't login");
  }else{

    //记录用户的登录，todo:基于redis实现
  }
  this.body = 'Done!';
}

users.register = function* () {

  if ('POST' != this.method) this.throw(405, "method is not allowed");
  var user = yield parse(this, {
    limit: '1kb'
  });
  user.password = md5_f.md5Sign(user.password,'gospel_users');
  console.log(user.password);
  var inserted  = yield models.gospel_users.create(user);
  if (!inserted) {
    this.throw(405, "register failed");
  }else{

    //注册成功
  }
  this.body = 'Done!';
}

module.exports = users;
