var models = require('../../models')
var assert = require('assert');
var parse = require('co-body');
var co = require('co');
var models = require('../../models');

var config = require('../../configs');

//数据渲染，todo:分页参数引入，异常信息引入
function render(data,code,message) {

	return {
		code: code,
		message: message,
		fields: data
	}
}
module.exports = {

    basicAuth: function *basicAuth(next){

            console.log("mount");
            console.log(this.url);
            var url = this.url.split("?")[0];
            if(url == '/users/login' || url == '/users/register' || url == '/weixin/callback' ){

                console.log("login or register");
                yield next;
            }else{
                //基础验证，即验证用户是否已经是登录状态
                //获取token
                var token =  this.headers['authorization'];
                console.log(token);
                if(token == null && token == undefined){

                    console.log("no auth");
                    this.status = 200
                    this.body = render(null,-100,'未登录!');
                }else{
                  var code  = yield models.gospel_innersessions.findById(token);
                  if(code !=null && code !=undefined) {
                      if((Date.now() -code.time) <= code.limitTime){

                          yield models.gospel_innersessions.modify({
                              id: code.id,
                              time: Date.now()
                          })
                          yield next;
                      }else {

                          yield models.gospel_innersessions.delete(code);
                          this.status = 200;
                          this.body = render(null,-100,'登录超时!');
                      }
                  }else{

                    this.status = 200;
                    this.body = render(null,-100,'登录超时!');
                  }
                }
              }
            }

}
// module.exports = function(opts){
//
//
//     console.log("mount");
//     switch (opts.operate) {
//       case "basicAuth": return function *basicAuth(next){
//
//         console.log("mount");
//
//         console.log(opts.ctx.session);
//
//         if(this.url == '/users/login' || this.url == '/users/register'){
//
//             console.log("login or register");
//             yield next;
//         }
//
//         console.log(this.method);
//
//         //基础验证，即验证用户是否已经是登录状态
//
//         //获取token
//         var token =  this.headers['authorization'];
//         // //根据token查询redis用户详细信息
//         // if (user && user.name == opts.name && user.pass == opts.pass) {
//         //
//         // } else {
//         //   this.throw(401);
//         // }
//         console.log(token);
//
//         if(token == null && token == undefined){
//
//             console.log("no auth");
//             this.status = 400
//             this.body = "no login";
//
//         }else{
//
//             var user = this.session[token];
//             console.log(user);
//             console.log(this.session.views);
//             yield next;
//         }
//         yield next;
//       }
//
//       break;
//       case "permissions": return function* (next){
//
//           //验证用户角色类型是否有权限访问
//
//       }
//
//       break;
//       case "auth": return function* (next){
//
//           //验证用户角色类型是否有权限访问
//
//       }
//       break;
//       default:
//
//     }
// }
