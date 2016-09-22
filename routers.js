var Controllers = require('./controllers')
var pay = require('./server/pay');


module.exports = function(router) {

	console.log(router);
	var controllers = new Controllers(router);

	router.get('*', function *(next) {
		console.log('ssss');
		yield next;
	});
	router.get('/',controllers.index);

	//添加路由
	controllers.route(router);

	//添加微信支付和支付支付异步回调路由

	pay.wechat.route(router);
	pay.alipay.route(router);
}
