var util = require('../utils.js');
var pay = require('../server/pay');
var _ = require('lodash');
var orders = {};


var PARAM_CONFIG = {
	'direct_check': ['out_trade_no', 'subject', 'total_fee', 'body', 'show_url'],
	'refund_check': ['refund_date', 'batch_no', 'batch_num', 'detail_data'],
	'customs_check': ['trade_no', 'out_request_no', 'amount', 'merchant_customs_code', 'merchant_customs_name', 'customs_place', 'is_split']
};
orders.order = function* () {

  var e = this.query;
  console.info('alipay create_direct_pay_by_user params:', e);
  	var args = _.pick(e, PARAM_CONFIG.direct_check);
  	if (_.keys(args).length === PARAM_CONFIG.direct_check.length) {
  		try {
  			pay.alipay.create_direct_pay_by_user(e, this);
  		} catch (error) {
  			console.error('create_direct_pay_by_user error:', error);

  		}
  	} else {

  	}
}
module.exports = orders;
