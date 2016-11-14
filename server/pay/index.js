var env = process.env.NODE_ENV || 'development';



var alipay = require('./alipay/index');

var wechat = require('./wechat');

module.exports = {
  wechat: wechat,
  alipay: alipay,
}
