var request = require('co-request');
var models = require('../../models');
var uuid = require('node-uuid');
var config = require('../../configs');
var models = require('../../models');
var fs = require('fs');

module.exports = getWechatAuths;

function getWechatAuths(appid_, secret_) {
  if (appid_ && secret_) {
    appid = appid_;
    secret = secret_;
  } else {
    return function*(next) {
      this.status = 400;
      console.log('参数错误');
      yield next;
    }
  }
  return function*(next) {
    var code = yield getCode(this);
    console.log("getcode: " + code);
    var res = yield getAccess_token(code);
    console.log(res);
    if (res == null) return this.status = 400;
    console.log("access_token: " + res.access_token);
    console.log("openid: " + res.openid);
    var userBase = yield getInfo(res.access_token, res.openid);
    console.log(userBase);
    console.log(userBase.openid + " userBase");
    if (userBase == null)return this.status = 400;
    var data = yield models.gospel_users.getAll({
      openId: userBase.openid
    });
    console.log(data);
    if (data.length < 1) {

      //完善信息
      console.log('first');
      var isInsert = yield models.gospel_users.create({
        name: userBase.nickname + '_wechat',
        photo: userBase.headimgurl,
        openId: userBase.openid,
        phone: '110',
        password: '882162BF9DA722446F86F7F690ACD5E0'
      });

      this.redirect("http://dash.gospely.com/#!/accounts/login?user=" + isInsert.id);
    } else {
      //设置登录
      console.log('second');
      var user = data[0].dataValues;
      var token = uuid.v4();
      yield models.gospel_innersessions.create({
        id: token,
        code: token,
        creater: user.id,
        time: Date.now(),
        limitTime: 30 * 60 * 1000
      });

      this.redirect("http://dash.gospely.com/#!/?token=" + token);
    }
  }
}


function* getCode(ctx) {
  var data = ctx.query;
  var code = data.code;
  return code;
}

function* getAccess_token(code) {
  var u = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid +
    "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
  try {
    var result = yield request({
      uri: u,
      method: 'GET',
      timeout: 5000
    });
    var response = result;
    var body = result.body;
    var data = JSON.parse(body);
    if (result.statusCode == 200 && data.errcode === undefined) {
      var res = {};
      res.access_token = data.access_token;
      res.openid = data.openid;
      return res;
    }
    return null;
  } catch (e) {
    return null;
  }
}

function* getInfo(access_token, openid) {
  try {
    var u = "https://api.weixin.qq.com/sns/userinfo?access_token=" +
      access_token + "&openid=" + openid;
    var result = yield request({
      uri: u,
      method: 'GET',
      timeout: 5000
    });
    var response = result;
    var body = result.body;
    var data = JSON.parse(body);
    if (result.statusCode == 200 && data.errcode === undefined)
      return data;

    return null;
  } catch (e) {
    return null;
  }
}
