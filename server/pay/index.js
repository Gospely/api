var env = process.env.NODE_ENV || 'development';



var alipay = require('./alipay');
var wechat = require('./wechat');

module.exports = {
  wechat: wechat,
  alipay: alipay
}
