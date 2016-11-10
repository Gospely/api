var Wxpay = require('./wechat').Wxpay;



var wechat_config = {
  appid: 'wx4d314d95c8a48f99',
  mch_id: '1400493402',
  key: '4da6c51e080bc1fd7a17f6b51ceff345'
}

var wechat = new Wxpay(wechat_config);


wechat.on('verify_fail', function() {
    console.log('index emit verify_fail')
  })
  .on('wxpay_trade_success', function(info) {
    console.log('test: wxpay_trade_success', info)
  })
module.exports = wechat;
