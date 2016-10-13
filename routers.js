var Controllers = require('./controllers')
var pay = require('./server/pay');

var getWechatAuths = require('./server/auth/wechat');


module.exports = function(router) {

	var controllers = new Controllers(router);

	router.get('*', function *(next) {
		console.log('ssss');
		yield next;
	});
	
	router.get('/',controllers.index);
	var appId = 'wx48e0c6824ebf0d3a';
	var secretKey= '4da6c51e080bc1fd7a17f6b51ceff345';

	router.get('/weixin/callback',getWechatAuths(appId,secretKey));

	//添加路由
	controllers.route(router);

	//添加微信支付和支付支付异步回调路由

	pay.wechat.route(router);
	pay.alipay.route(router);
}
