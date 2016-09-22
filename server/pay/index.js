var env = process.env.NODE_ENV || 'development';


var ali_config = {
	partner: '', //合作身份者id，以2088开头的16位纯数字
	key: '', //安全检验码，以数字和字母组成的32位字符
	seller_email: '', //卖家支付宝帐户 必填
	host: '' //域名
}

var Alipay = require('./alipay').Alipay;
var alipay = new Alipay(ali_config);

alipay.on('verify_fail', function() {
		console.log('index emit verify_fail')
	})
	.on('create_direct_pay_by_user_trade_success', function(out_trade_no, trade_no,callback) {
		console.log('test： callback: create_direct_pay_by_user_trade_success')
		return callback();
	})
	.on('refund_fastpay_by_platform_pwd_success', function(batch_no, success_num, result_details,callback) {
		console.log('test： callback: refund_fastpay_by_platform_pwd_success')
		return callback();
	})


  var wechat_config = {
    	appid: '',
    	mch_id: '',
    	Key: ''
    }
  var Wxpay = require('./wechat').Wxpay;

  var wechat = new Wxpay(wechat_config);

  wechat.on('verify_fail', function() {
  		console.log('index emit verify_fail')
  	})
  	.on('wxpay_trade_success', function(info) {
  		console.log('test: wxpay_trade_success',info)
  	})


module.exports = {
  wechat: wechat,
  alipay: alipay
}
