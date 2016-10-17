var util = require('../utils.js');
var models =require('../models');
var md5_f = require('../utils/MD5');
var parse = require('co-body');
var mail = require('../server/mail/email');
var uuid = require('node-uuid');
var config = require('../configs')
var users = {};


//数据渲染，todo:分页参数引入，异常信息引入
function render(data,code,messge) {

	return {
		code: code,
		message: messge,
		fields: data
	}
}

users.login = function* (){

  if ('POST' != this.method) this.throw(405, "method is not allowed");
  var user = yield parse(this, {
    limit: '1kb'
  });
  user.password = md5_f.md5Sign(user.password,'gospel_users');
  var data = yield models.gospel_users.findAll({where: user});
  console.log(data.length);
  if(data == null|| data == undefined || data.length != 1){

      console.log("用户名或者密码错误");
      this.body = render(null,-1,"用户名或者密码错误");
  }else{

    var token = uuid.v4();
		console.log("user" + token);
    var user = data[0].dataValues;
    user.password = '';
    user.token = token;
    this.cookies.set('accessToken', token, config.cookie);
  	yield models.gospel_innersessions.create({
				id: token,
				code: token,
				creater: user.id,
				time: Date.now(),
				limitTime: 30 * 60 *1000
		});
    this.body = render(user,1,"登录成功");
    //记录用户的登录，todo:基于redis实现
  }
}

users.register = function* () {



  console.log(this.method);
  if ('POST' != this.method) this.throw(405, "method is not allowed");
  var user = yield parse(this, {
    limit: '1kb'
  });
  user.password = md5_f.md5Sign(user.password,'gospel_users');
  console.log(user.password);

  if (user.phone != "") {
     console.log(user.phone);
       var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
        isok= reg.test(user.phone );
        var activeCode = uuid.v4();
       if (!isok) {
         console.log(user.phone);
         // 设置邮件内容
         var active = "http://api.gospely.com/users/authorization?code="+activeCode;
         console.log(active);
         var mailOptions = {

           from: "龙猫科技 <shark@dodora.cn>", // 发件地址
           to: user.phone, // 收件列表
           subject: "Hello world", // 标题
           html: "<a href='"+active+"'>"+active+"</a></br>复制到浏览器访问" // html 内容
         }
         mail(mailOptions);

         var authorization = {
              code: activeCode,
              time: Date.now()
         };
         var inserted  = yield  models.gospel_innersessions.create(authorization);
       }
  }
  user.isblocked = 1;
  var inserted  = yield models.gospel_users.create(user);


  if (!inserted) {
    this.throw(405, "register failed");
  }else{
      this.body = 'Done!'
    //注册成功
  }
  this.body = 'Done!';
}
users.updatePhoto = function* () {

  if ('POST' != this.method) this.throw(405, "method is not allowed");
  var user = yield parse(this, {
    limit: '2MB'
  });


  if(user.id == null || user.id == undefined) this.throw(405, "method is not allowed");

  var inserted = yield models.gospel_users.modify(user);
  if (!inserted) {
    this.throw(405, "couldn't be added.");
  }
  this.body = 'Done!';
  this.body = 'Done!';
}

users.authorization = function* () {

    if ('GET' != this.method) this.throw(405, "method is not allowed");

      var data = yield models.gospel_innersessions.getAll(this.query);
      if(data.length != 1){
          this.body = '失效!';
      }else{
          console.log(data[0].dataValues.time - Date.now());
          if((Date.now() -data[0].dataValues.time) <= data[0].dataValues.limitTime){

              //更新用户状态
              this.body = 'Done!';
          }else {
              this.body = '超时!';
          }
      }
}
users.weixinLogin = function * () {

    var config = yield  models.gospel_configs.findById('wechat.login.config');

    var url = "https://open.weixin.qq.com/connect/qrconnect?appid="+config.appid+"&redirect_uri=http://api.gospely.com/weixin/callback&response_type=code&scope=snsapi_login&state=12123#wechat_redirect";

    url = encodeURI(url);
    this.redirect(url);
}
module.exports = users;
