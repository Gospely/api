var Wxpay = require('./wechat').Wxpay;



  var wechat_config = {
    	appid: '',
    	mch_id: '',
    	Key: ''
    }

var wechat = new Wxpay(wechat_config);


wechat.on('verify_fail', function() {
    console.log('index emit verify_fail')
  })
  .on('wxpay_trade_success', function(info) {
    console.log('test: wxpay_trade_success',info)
  })
module.exports = wechat;
