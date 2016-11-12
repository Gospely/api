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
		var user = yield models.gospel_users.findById(order.creator);
		var currentSize = order.size;
		if (order.unit = 'GB') {
			order.size = (order.size * 1024 * 1024) / 512;
		} else {
			order.size = order.size * 1024
		}
		var extend = {
			size: order.size,
			docker: user.volume
		}
		var result = shells.extendsVolume(extend);

		if (result == 'success') {

			yield models.gospel_users.update({
				id: order.creator,
				volumeSize: currentSize
			});
			ctx.body == {
				code: 1,
				message: "扩容成功"
			}
		} else {
			//扩容失败
		}

	}
}

module.exports = orders
