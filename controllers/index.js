var util = require('../utils.js');
var users = require('./users.js');
var common = require('./common.js');
var groups = require('./groups.js');
var companys = require('./companys.js');
var products = require('./products.js');

module.exports = function() {
	return {

		index: function *(next) {
			this.body = util.resp('200', 'gospel api');
		},
		common: common,
		groups: groups,
		companys: companys,
		products: products
	}

}
