/* *
 * 类名：WxpaySubmit
 * 功能：微信各接口请求提交类
 * 详细：构造微信各接口表单HTML文本，获取远程HTTP数据
 */

var core_funcs = require('./wxpay_core.function');
var md5_f = require('../../../utils/MD5');
var _ = require('lodash');
// var DOMParser = require('xmldom').DOMParser;

function WxpaySubmit(wxpay_config) {
    this.wxpay_config = wxpay_config;
}

/**
 * 生成签名结果
 * @param para_sort 已排序要签名的数组
 * return 签名结果字符串
 */
WxpaySubmit.prototype.buildRequestMysign = function(para_sort) {
    //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
    var prestr = core_funcs.createLinkstring(para_sort);
    console.log(this.wxpay_config['key']);
    var mysign = md5_f.md5Sign(prestr, this.wxpay_config['key']);
    console.log(mysign);
    return mysign;
}

/**
 * 生成要请求给微信的参数数组
 * @param para_temp 请求前的参数数组
 * @return 要请求的参数数组
 */
WxpaySubmit.prototype.buildRequestPara = function(para_temp) {
    //除去待签名参数数组中的签名参数
    var para_filter = core_funcs.paraFilter(para_temp);

    //对待签名参数数组排序
    var para_sort = core_funcs.argSort(para_filter);

    //生成签名结果
    console.log(para_sort);
    var sign_data = this.buildRequestMysign(para_sort);

    //签名结果加入请求提交参数组中
    para_sort['sign'] = sign_data;

    return para_sort;
}

/**
 * 生成要请求给微信的参数数组
 * @param para_temp 请求前的参数数组
 * @return 要请求的参数数组字符串
 */
WxpaySubmit.prototype.buildRequestParaToString = function(para_temp) {
    //待请求参数数组
    var para = this.buildRequestPara(para_temp);

    //把参数组中所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串，并对字符串做urlencode编码
    var request_data = core_funcs.createLinkstringUrlencode(para);

    return request_data;
}

exports.WxpaySubmit = WxpaySubmit;
