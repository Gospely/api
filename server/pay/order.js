var models = require("../../models");
var shells = require('../../shell');
var processor = require('../../process');

var orders = {

	order_success: function*(orderNo, ctx) {

		var orders = yield models.gospel_orders.getAll({
			orderNo: orderNo
		});
		console.log(orders.length);
		if (orders.length == 1) {
			var order = orders[0].dataValues;
			var result = yield operate[order.type](order, ctx);
			yield models.gospel_orders.modify({
				id: order.id,
				status: 2
			})
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
		console.log(order);
		var product = yield models.gospel_products.findById(order.products);


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

		date = date.setMonth(date.getMonth() + 1 + order.timeSize);
		console.log(date);
		yield models.gospel_ides.modify({
			id: ide.id,
			expireAt: date,
			name: product.name
		});
		yield models.gospel_users.modify({
			id: order.creator,
			ide: ide.id,
			ideName: product.name
		});
		console.log("ide");
	},
	//创建付费应用
	docker: function*(order, ctx) {

		var application = yield models.gospel_applications.findById(order.application);
		application.products = order.products;
		var result = yield processor.app_start(application);
		console.log("docker");
		yield models.gospel_applications.modify({
			id: application.id,
			payStatus: 1
		});
	},
	//数据卷扩容
	volume: function*(order, ctx) {

		console.log("volume");
		console.log(order);
		var user = yield models.gospel_users.findById(order.creator);
		var currentSize = parseInt(order.size) + parseInt(user.volumeSize);
		console.log(currentSize);
		if (order.unit = 'GB') {
			console.log("ss");
			order.size = (currentSize * 1024 * 1024 * 1024) / 512;
		} else {
			order.size = currentSize.size * 1024 * 1024
		}

		var extend = {
			size: order.size,
			docker: user.volume
		}
		console.log(extend);
		yield shells.extendsVolume(extend);


		yield models.gospel_users.modify({
			id: user.id,
			volumeSize: currentSize
		});
	}
}

module.exports = orders
