var util = require('../utils.js');
var pay = require('../server/pay');
var uuid = require('node-uuid');
var parse = require('co-body');
var _md5 = require('../utils/MD5');
var models = require('../models');

//数据渲染，todo:分页参数引入，异常信息引入
function render(data, all, cur, code, message) {

	return {
		code: code,
		message: message,
		all: all,
		cur: cur,
		fields: data
	}
}

var orders = {};

orders.create = function*() {

  var order = yield parse(this, {
    limit: '10kB'
  });

  if (order.type == 'wechat') {
    var pay_url = yield pay.wechat.wxpay_pay({
      body: 'test', //商品描述,
      out_trade_no: order.out_trade_no, //商户订单号,
      total_fee: 0.01 * 100, //金额,
	//   total_fee: order.price * 100, //金额,
      spbill_create_ip: '127.0.0.1', //终端IP,
      product_id: '', //商品id 选,
      detail: 'dodora', //商品详情 选
      attach: '', //附加数据 选
      time_start: '', //订单生成时间 yyyyMMddHHmmss  选
      time_expire: '', //订单失效时间，格式为yyyyMMddHHmmss  选
      fee_type: '', //货币类型 选
    }, this);
    this.body = pay_url;
  } else {
      var url = pay.alipay.create_direct_pay_by_user({
          out_trade_no: order.out_trade_no //商户订单号, 商户网站订单系统中唯一订单号，必填
          ,
          subject: 'IDE' //订单名称 必填
          ,
          total_fee: order.price //付款金额,必填
          ,
          body: "dodora" //订单描述
          ,
          show_url: '1' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
      }, this);
      this.body = url;
      var pay_url = yield pay.wechat.wxpay_pay({
          body: 'Gospel services', //商品描述,
          out_trade_no: order.orderNo, //商户订单号,
          total_fee: 0.01, //金额,
		//   total_fee: order.price * 100, //金额,
          spbill_create_ip: '127.0.0.1', //终端IP,
          product_id: '', //商品id 选,
          detail: 'dodora', //商品详情 选
          attach: '', //附加数据 选
          time_start: '', //订单生成时间 yyyyMMddHHmmss  选
          time_expire: '', //订单失效时间，格式为yyyyMMddHHmmss  选
          fee_type: '', //货币类型 选
      }, this);
      order.wechat = pay_url.code_url;
      var url = pay.alipay.create_direct_pay_by_user({
          out_trade_no: order.orderNo //商户订单号, 商户网站订单系统中唯一订单号，必填
          ,
          subject: 'Gospel services' //订单名称 必填
          ,
          total_fee: order.price //付款金额,必填
          ,
          body: "dodora" //订单描述
          ,
          show_url: '1' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
      }, this);
      order.alipay = url;

      var inserted = yield models.gospel_orders.create(order);
      if (!inserted) {
          this.throw(405, "couldn't be added.");
      }
      this.body = render(inserted, null, null, 1, '下单成功，请选择支付方式支付');
  }
}
module.exports = orders;
