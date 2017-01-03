var WxpayNotify = require('./wxpay_notify.class').WxpayNotify;
var WxpaySubmit = require('./wxpay_submit.class').WxpaySubmit;
var core_funcs = require('./wxpay_core.function');
var assert = require('assert');
var url = require('url');
var path = require('path');
var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter;
var https = require('https');
var xml2js = require('xml2js');
var _ = require('lodash');
var Promise = require('bluebird');
var xmlbuilder = require('xmlbuilder');
var qs = require('querystring');
var extendBodyParser = require('./extend_body_parser').extendBodyParser;
var parse = require('raw-body');

var default_wxpay_config = {
  certFile: __dirname + '/apiclient_cert.pem',
  keyFile: __dirname + '/apiclient_key.pem',
  caFile: __dirname + '/rootca.pem',
  host: 'http://api.gospely.com', //网址
  wxpay_notify_url: '/pay/return_url/wxpay', //通知的回调url
  wxpay_pay_url: 'https://api.mch.weixin.qq.com/pay/unifiedorder', //支付
  wxpay_refund_url: 'https://api.mch.weixin.qq.com/secapi/pay/refund' //退款
};

function Wxpay(wxpay_config) {
  EventEmitter.call(this);

  //default config
  this.wxpay_config = default_wxpay_config;
  //config merge
  _.merge(this.wxpay_config, wxpay_config);
}

/**
 * @ignore
 */
inherits(Wxpay, EventEmitter);

//extendBodyParser 微信post的报文头部没有Content-Type=application/json不会被express的bodyParser处理
Wxpay.prototype.route = function(app) {
  var self = this;
  app.post(this.wxpay_config.wxpay_notify_url, function*() {
    console.log(this.url);
    var data = yield parse(this.req, {
      length: this.length,
      limit: '1mb',
      encoding: this.charset || 'utf-8'
    });
    var data = yield self.wxpay_notify(data, this);
    console.log(data);
  });
}

//微信支付接口 取二维码
/*data{
    body:''//商品描述,
    out_trade_no:''//商户订单号,
    total_fee:''//金额,
    spbill_create_ip:''//终端IP,
    product_id：''//商品id 选,
    detail:''//商品详情 选
    attach：''//附加数据 选
    time_start:''//订单生成时间 yyyyMMddHHmmss  选
    time_expire:''//订单失效时间，格式为yyyyMMddHHmmss  选
    fee_type:''//货币类型 选
 }*/
Wxpay.prototype.wxpay_pay = function(data, ctx) {
  var wxpaySubmit = new WxpaySubmit(this.wxpay_config);
  var wxpayNotify = new WxpayNotify(this.wxpay_config);
  console.log(data);
  var infoList = ['prepay_id', 'code_url'];

  data.out_trade_no = data.out_trade_no;

  //构造要请求的参数数组，无需改动
  var parameter = {
    appid: this.wxpay_config.appid,
    mch_id: this.wxpay_config.mch_id,
    device_info: 'WEB',
    fee_type: 'CNY',
    notify_url: this.wxpay_config.host + this.wxpay_config.wxpay_notify_url, //服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，
    trade_type: 'NATIVE',
    nonce_str: core_funcs.getRndStr(18)
  };
  _.merge(parameter, data);

  var postData = wxpaySubmit.buildRequestPara(parameter);
  console.log(postData);
  return wxpayNotify.getHttpResponsePOST(this.wxpay_config.wxpay_pay_url,
    postData, infoList).then(result => {

    return result;
  });
}

/**
 * 退款接口
 * data{
 *  out_refund_no:'',//商户退款流水号
 *  out_trade_no: '', //原商户订单流水号
 *  total_fee:'', //总金额 分
 *  refund_fee：'',//退款金额 分
 *  refund_fee_type :'',// 货币种类 选填
 }
 */
Wxpay.prototype.wxpay_refund = function(data, res) {
  var wxpaySubmit = new WxpaySubmit(this.wxpay_config);
  var wxpayNotify = new WxpayNotify(this.wxpay_config);

  var infoList = ['out_trade_no', 'out_refund_no', 'refund_fee',
    'settlement_total_fee'
  ];

  //构造要请求的参数数组，无需改动
  var parameter = {
    appid: this.wxpay_config.appid,
    mch_id: this.wxpay_config.mch_id,
    nonce_str: core_funcs.getRndStr(18),
    op_user_id: this.wxpay_config.mch_id
  };
  _.merge(parameter, data)

  var postData = wxpaySubmit.buildRequestPara(parameter);
  //post
  return wxpayNotify.getHttpsResponsePOST(this.wxpay_config.wxpay_refund_url,
    postData, infoList).then(result => {
    return res.status(200).json(result);
  });
};

/**
 *  支付结果异步通知
 */
Wxpay.prototype.wxpay_notify = function*(data, ctx) {
  var self = this;
  var infoList = ['attach', 'time_end', 'rate', 'transaction_id', 'total_fee',
    'out_trade_no', 'openid'
  ];
  console.log(data);
  console.log("parseXml");
   var _POST = yield parseXml();
   console.log(_POST);
   if(_POST != 'error'){

       console.log("wxpayNotify");
       var verify_result = yield wxpayNotify.verifyNotify(_POST);
       if (verify_result) { //验证成功
         self.emit('wxpay_trade_success', _.pick(_POST, infoList));
         ctx.body = xmlbuilder.create('xml', {
           headless: true
         }).ele({
           return_code: 'SUCCESS'
         }).end({
           pretty: true
         }); //请不要修改或删除
       } else {
         //验证失败
         self.emit("verify_fail");
         ctx.body = xmlbuilder.create('xml', {
           headless: true
         }).ele({
           return_code: 'FAIL'
         }).end({
           pretty: true
         });
       }
   }

    function parseXml(){
        return new Promise(function(resolve,reject){
            new xml2js.Parser({
              explicitArray: false,
              explicitRoot: false
          }).parseString(data,function(err,_POST){
              console.log(err);
              console.log(_POST);
              if(_POST.return_code != 'SUCCESS' || _POST.result_code != 'SUCCESS'){
                  reject("error");
              }else{
                  resolve(_POST);
              }
          });
        });
    }
}

exports.Wxpay = Wxpay;
