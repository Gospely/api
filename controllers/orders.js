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
  if(orders.type == 'wechat') {
      pay.wechat.wxpay_pay({
        body: 'test',//商品描述,
        out_trade_no: "orders.out_trade_no",//商户订单号,
        total_fee:0.01,//金额,
        spbill_create_ip: '',//终端IP,
        product_id: 'out_trade_no',//商品id 选,
        detail:'test',//商品详情 选
        attach:'',//附加数据 选
        time_start:'',//订单生成时间 yyyyMMddHHmmss  选
        time_expire:'',//订单失效时间，格式为yyyyMMddHHmmss  选
        fee_type:'',//货币类型 选
      },this)
  }else{
    var url = pay.alipay.create_direct_pay_by_user(  {
        out_trade_no: orders.out_trade_no//商户订单号, 商户网站订单系统中唯一订单号，必填
        ,subject:'IDE' //订单名称 必填
        ,total_fee: 0.01  //付款金额,必填
        ,body:'1' //订单描述
        ,show_url:'1' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
      },this);
      this.body = url;
  }

}
module.exports = orders;
