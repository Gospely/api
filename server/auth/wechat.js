var request = require('co-request');
var models =require('../../models');
var uuid = require('node-uuid');
var config = require('../../configs');

module.exports = getWechatAuths;

function getWechatAuths(appid_, secret_) {
    if (appid_ && secret_) {
        appid = appid_;
        secret = secret_;
    } else {
        return function *(next)
        {
            this.status = 400;
            console.log('参数错误');
            yield next;
        }
    }
    return function *(next)
    {
        var code = yield getCode(this);
        console.log("getcode: " + code);
        var res = yield getAccess_token(code);
        if (res == null) return this.status = 400;
        console.log("access_token: " + res.access_token);
        console.log("openid: " + res.openid);
        var userBase = yield getInfo(res.access_token, res.openid);
        if (userBase = null)return this.status = 400;

        //获取到了用户的详细信息

        var userBase = {"openid":"ouvLcwUfaoXgmY_vr2Xa4a4YDn68","nickname":"Sharkseven","sex":1,"language":"zh_CN","city":"Nanchang","province":"Jiangxi","country":"CN","headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/Q3auHgzwzM5ibkUVWRiafgndMU46DVwY4wCoGHskX2HIoicFcKwfKxWU8DZM7Kc2bOqy0auNsowPgErHYD4pJdibYA\/0","privilege":[],"unionid":"o4y4CvyGj6qXeOsLSWbKawN2YEyQ"};

        var data = yield models.gospel_users.getAll(
           {
            openId: userBase['unionid']
          }
        );
        if(data.length == 0){

            //完善信息

            var isInsert = yield models.gospel_users.create({
              name:userBase['nickname'],
              photo:userBase['headimgurl'],
              openId:userBase['unionid'],
              phone:'110',
              password:'123'
            });

            var token = uuid.v4();

            this.cookies.set('accessToken', token, config.cookie);

            this.session[token] = {
              name:userBase['nickname'],
              photo:userBase['headimgurl'],
              openId:userBase['unionid'],
              phone:'110',
              password:'123'
            }

            this.redirect("http://www.baidu.com?openId= " + userBase['unionid']);
        }else{
          //设置登录
          var token = uuid.v4();

          this.cookies.set('accessToken', token, config.cookie);

          this.session[token] = {
            name:userBase['nickname'],
            photo:userBase['headimgurl'],
            openId:userBase['unionid'],
            phone:'110',
            password:'123'
          }
          this.redirect("http://localhost:8088");
        }
    }
}


function * getCode(ctx)
{
    var data = ctx.query;
    var code = data.code;
    //console.log("code: "+code);
    return code;
}

function * getAccess_token(code)
{
    var u = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
    try {
        var result = yield request({
            uri: u,
            method: 'GET',
            timeout: 5000});
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
        console.log('getAccess_token wrong');
        return null;
    }
}

function * getInfo(access_token, openid)
{
    try {
        var u = "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid;
        var result = yield request({
            uri: u,
            method: 'GET',
            timeout: 5000});
        var response = result;
        var body = result.body;
        console.log(body);
        var data = JSON.parse(body);
        if (result.statusCode == 200 && data.errcode === undefined)
            return data;

        return null;
    } catch (e) {
        return null;
    }
}
