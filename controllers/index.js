var util = require('../utils.js');
var users = require('./users.js');
var common = require('./common.js');

var pay = require("../server/pay");

module.exports = function() {
	return {

		index: function *(next) {
			this.body = util.resp('200', 'Gospel API List Version 1.0');
		},
		common: common
	}

}
