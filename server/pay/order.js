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

		} else {
			ctx.body = {
				code: -1,
				message: "更改状态失败"
			}
		}

	}
}


var operate = {
	ide: function*(order, ctx) {
		console.log("ide");
	},
	docker: function*(order, ctex) {
		console.log("docker");
	},
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
