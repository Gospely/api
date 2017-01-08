var models = require("../../models");
var shells = require('../../shell');
var processor = require('../../process');

var orders = {

	order_success: function*(orderNo, ctx, type) {

		console.log(orderNo);
		var orders = yield models.gospel_orders.getAll({
			orderNo: orderNo
		});
		if (orders.length == 1) {
			var order = orders[0].dataValues;
			var result = yield operate[order.type](order, ctx);
			yield models.gospel_orders.modify({
				id: order.id,
				status: 2
			})
			if(type='alipay'){
				ctx.redirect('http://dash.gospely.com/#!/accounts/orders?code=pay')
			}
		} else {
			ctx.body = {
				code: -1,
				message: "更改状态失败"
			}
		}

	}
}


var operate = {
	//IDE 版本升级和续费
	ide: function*(order, ctx) {
		console.log(order.products);
		var product = yield models.gospel_products.findById(order.products);
		console.log(product);

		var ides = yield models.gospel_ides.getAll({
			creator: order.creator
		});
		var ide = ides[0].dataValues;
		var date;

		if (ide.expireAt == null) {
			date = new Date();
		} else {
			date = new Date(ide.expireAt);
		}

		date = date.setMonth(date.getMonth()  + order.timeSize);
		yield models.gospel_ides.modify({
			id: ide.id,
			product: order.products,
			expireAt: date,
			name: product.name
		});
		yield models.gospel_users.modify({
			id: order.creator,
			ide: ide.id,
			ideName: product.name
		});
	},
	//创建付费应用
	docker: function*(order, ctx) {

		var application = yield models.gospel_applications.findById(order.application);
		application.products = order.products;
		var result = yield processor.app_start(application);
		yield models.gospel_applications.modify({
			id: application.id,
			payStatus: 1
		});
	},
	//数据卷扩容
	volume: function*(order, ctx) {

		var user = yield models.gospel_users.findById(order.creator);
		var currentSize = parseInt(order.size) + parseInt(user.volumeSize);
		if (order.unit = 'GB') {
			order.size = (currentSize * 1024 * 1024 * 1024) / 512;
		} else {
			order.size = currentSize.size * 1024 * 1024
		}

		var extend = {
			size: order.size,
			docker: user.volume
		};
		yield shells.extendsVolume(extend);

		yield models.gospel_users.modify({
			id: user.id,
			volumeSize: currentSize
		});
	}
}

module.exports = orders
