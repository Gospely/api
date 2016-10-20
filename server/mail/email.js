var nodemailer = require("nodemailer");

var config = require('../../configs');

module.exports = function(options) {

  // 开启一个 SMTP 连接池
  var smtpTransport = nodemailer.createTransport("SMTP",config.mail);



  // 发送邮件
  smtpTransport.sendMail(options, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }
    smtpTransport.close(); // 如果没用，关闭连接池
  });
}
