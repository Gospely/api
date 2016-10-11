var util = require('../utils.js');
var pay = require('../server/pay');

var orders = {};

orders.order = function* () {

    console.log("order");
    var order = {
     out_trade_no:'111' //商户订单号, 商户网站订单系统中唯一订单号，必填
     ,subject:'test' //订单名称 必填
     ,total_fee:'0.1' //付款金额,必填
     ,body:'test' //订单描述
     ,show_url:'http://baidu.com' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
     }
    pay.alipay.create_direct_pay_by_user(order,this);
}
module.exports = orders;
