var nodemailer = require("nodemailer");

var config = require('../../configs');

// 开启一个 SMTP 连接池
var smtpTransport = nodemailer.createTransport("SMTP",config.mail);

// 设置邮件内容
var mailOptions = {
  from: "罗文辉 <shark@dodora.cn>", // 发件地址
  to: "937257166@qq.com", // 收件列表
  subject: "Hello world", // 标题
  html: "<b>thanks a for visiting!</b> 世界，你好！" // html 内容
}

// 发送邮件
smtpTransport.sendMail(mailOptions, function(error, response){
  if(error){
    console.log(error);
  }else{
    console.log("Message sent: " + response.message);
  }
  smtpTransport.close(); // 如果没用，关闭连接池
});
