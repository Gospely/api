var Pay = require('./pay');

var pay = new Pay({
  partner:'2088421937560320' //合作身份者id，以2088开头的16位纯数字
  ,key:'5msupwk7dm3hmzgzbe2x89mz1kx17yb8'//安全检验码，以数字和字母组成的32位字符
  ,seller_id:'2088421937560320'//卖家支付宝用户号 必填，可能和合作身份者id相同
  ,notify_url: ''
  ,return_url: ''
  ,service: 'create_direct_pay_by_user'
});

function cb(optons,url) {

    console.log(url);
}
pay.buildRequest({
     out_trade_no:'111' //商户订单号, 商户网站订单系统中唯一订单号，必填
     ,subject:'测试' //订单名称 必填
     ,total_fee:'0.1' //付款金额,必填
     ,body:'测试' //订单描述
     ,show_url:'http://baidu.com' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
     },cb);
