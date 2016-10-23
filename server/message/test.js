// var message = require('./message');
//
// var options = {
//
//     mobile:13456887748,
//     msg: '【江西龙猫科技】123456，是您的短信验证码，请在60秒内提交验证码',
//     needstatus: false
// }
// message(options)

var range=function(start,end)
 {
          var array=[];
          for(var i=start;i<end;++i) array.push(i);
          return array;
};
var randomstr = range(0,6).map(function(x){
 return Math.floor(Math.random()*10);
}).join('');
console.log(randomstr);
var phone = '937257166@qq.com';
var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
 isok= reg.test(phone );
console.log(isok);
 reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
 isok= reg.test(phone);
console.log(isok);
