var models = require('../../models')
var assert = require('assert');
var parse = require('co-body');
var co = require('co');

module.exports = function(opts){

  {
      basic:   return function *basicAuth(next){

        //基础验证，即验证用户是否已经是登录状态

        //获取token
        var token =  this.headers['Authorization']

        //根据token查询redis用户详细信息
        if (user && user.name == opts.name && user.pass == opts.pass) {
          yield next;
        } else {
          this.throw(401);
        }
      };
      permissions: return function* (next){

          //验证用户角色类型是否有权限访问

      },
      auth: {

        //auth 授权
      }

  }




};
