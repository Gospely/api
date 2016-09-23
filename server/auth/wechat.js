var request = require('request');
var config = require('./config');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits,
var parser =  require('co-body');
var _ = require('lodash');
var models = require('../../models');
var qs = require('querystring');
var co = require('co');

function WXLogin = function (param){
  EventEmitter.call(this);
  this.default_config = {

    gateway_url: 'https://api.weixin.qq.com'
    connect_url: 'https://open.weixin.qq.com/connect/qrconnect',
    access_token_url: '/sns/oauth2/access_token',
    refresh_url: '/sns/oauth2/refresh_token',
    userinfo_url: '/sns/userinfo',
    auth_check_url: '/sns/auth',
    weixin_login_url: '/users/login/weixin'
  };

}

inherits(WXLogin,EventEmitter);

WXLogin.prototype.route = function(router) {

  router.get(config.redirect_url, function* (){ self.callback(this); });
  router.get(this.default_config.weixin_login_url, function *(){ this.redirect(self.connect()); })
}

//重定向到微信扫码登录
WXLogin.prototype.connect = function() {

    var parameter = {
        appid: config.wexin.appid,
        redirect_uri: config.wexin.redirect_uri,
        response_type: 'code',
        scope: config.wexin.scope,
        state: 'state' //随机生成，并在会话阶段记录
    };
    var url = this.default_config.connect_url+'?'+querystring(parameter);
    return url;
}


function access(ctx) {


}

function refresh(ctx) {


}

function auth(ctx) {


}
function userInfo(ctx) {

}
WXLogin.prototype.callback = function(ctx){

    var code = ctx.query.code;

    var parameter = {
        appid: config.wexin.appid,
        secret: config.wexin.appsecret,
        code: this.query.code,
        grant_type: 'authorization_code'
    };
    var url = this.default_config.gateway_url+this.default_config.access_token_url+'?'+querystring(parameter);
    co(function *(){

        var accress_res = yield request.get(url);

        //查询数据库，判断用户是否绑定，查询不到，错误提醒


        //检查access_token是否合法
        var parameter_auth = {
            access_token: data.access_token,
            openid: data.openid
        };
        url=this.default_config.gateway_url+this.default_config.auth_check_url+'?'+querystring(parameter_auth);

        auth_res = yield request.get(url);



        if(auth_res.errcode === '0'){

          var parameter_auth = {
              access_token: data.access_token,
              openid: data.openid,
              lang: 'cn'
          };
          url=this.default_config.gateway_url+this.default_config.userinfo_url+'?'+querystring(parameter_auth);
        }

    })();
    //请求获取access_token
}

function submit (url,data) {

  request.get(url, {form: data},function (err,httpResponse,body) {
    console.log(body);
  });

}
