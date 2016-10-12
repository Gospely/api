'use strict';
let MD5 = require('md5');
let request = require('superagent');

let ALIPAY_GATEWAY_NEW = 'https://mapi.alipay.com/gateway.do?';

/*
 * 支付宝即时到账SDK
 */
class AlipayCore{

  /**
   * Constructor
   * @param  {Object} opts 支付宝即时到账接口参数
   */
  constructor(opts){
    opts = opts || {};
    this.opts = {};
    this.key = opts['key'];
    this.opts['sign_type'] = 'MD5';
    this.opts['partner'] = opts['partner'];
    this.opts['_input_charset'] = 'utf-8';
    this.opts['service'] = opts['service'];
    this.opts['seller_id'] = opts['partner'];
    this.opts['notify_url'] = opts['notify_url'] || '';
    this.opts['return_url'] = opts['return_url'] || '';
  }

  /*
   * 生成`key=value&key=value`格式链接
   * @Param {Object} params 支付请求参数
   * @Return {String} 生成的字符串
   */
  createLinkString(params){
    let prestr = '';
    let keys = Object.keys(params).sort();
    return keys.reduce((prev,next,i)=>{
      if(i != keys.length-1){
        return prev + next + '=' + params[next] + '&';
      }else{
        return prev + next + '=' + params[next];
      }
    },prestr);
  }

  /*
   * 过滤字段
   * @Param {Object} params 支付请求参数
   * @Return {Object} result 过滤后的对象
   */
  paraFilter(params){
    let result = {};
    if(params == undefined){
      return resilt;
    }
    for(let a in params){
      if(params[a] == null || params[a] == '' ||
         a == 'sign' || a == 'sign_type'){
        continue;
      }
      result[a] = params[a];
    }
    return result;
  }

  /*
   * 生成带签名的请求参数对象
   * @Param {Object} Params 支付请求的对象
   * @Return {Object} sPara 带sign的对象
   */
  buildRequestPara(Params){
    let sPara = this.paraFilter(Params);
    let mysign = this.buildRequestMysign(sPara);
    sPara['sign'] = mysign;
    sPara['sign_type'] = this.opts.sign_type;
    return sPara;
  }

  /*
   * 生成签名
   * @Param {Object} sPara 支付请求的对象
   * @Return {String} mysign 签名
   */
  buildRequestMysign(sPara){
    let prestr = this.createLinkString(sPara);
    let mysign = '';
    if(this.opts.sign_type == 'MD5'){
      mysign = MD5(prestr + this.key);
    }
    return mysign;
  }

  /*
   * 创建支付请求
   * @Param {Object} sParaTemp 支付请求的对象
   * @Param {Function} cb callback
   */
  buildRequest(sParaTemp,cb){
    try{
      sParaTemp = Object.assign(sParaTemp,this.opts);
      let sPara = this.buildRequestPara(sParaTemp);
      let url = ALIPAY_GATEWAY_NEW + this.createLinkString(sPara);
      cb && cb(null,url);
    }catch(err){
      cb && cb(err,null);
    }
  }

}

module.exports = AlipayCore;
