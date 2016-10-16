var util = require('../utils.js');
var pay = require('../server/pay');
var uuid = require('node-uuid');
var parse = require('co-body');

var orders = {};

orders.order = function* () {


  var orders = yield parse(this, {
    limit: '10kB'
  });
    orders.out_trade_no = uuid.v4();

  var url = pay.alipay.create_direct_pay_by_user(  {
      out_trade_no: uuid.v4()//商户订单号, 商户网站订单系统中唯一订单号，必填
      ,subject:'IDE' //订单名称 必填
      ,total_fee: 0.01  //付款金额,必填
      ,body:'1' //订单描述
      ,show_url:'1' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
    },this);
    this.body = url;
}
module.exports = orders;
