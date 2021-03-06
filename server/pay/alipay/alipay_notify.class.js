/* *
 * 类名：AlipayNotify
 * 功能：支付宝通知处理类
 * 详细：处理支付宝各接口通知返回
 */

var core_funcs = require('./alipay_core.function');
var md5_f = require('./alipay_md5.function');

function AlipayNotify(alipay_config) {
  /**
   * HTTPS形式消息验证地址
   */
  this.https_verify_url =
    'https://mapi.alipay.com/gateway.do?service=notify_verify&';
  /**
   * HTTP形式消息验证地址
   */
  this.http_verify_url = 'http://notify.alipay.com/trade/notify_query.do?';
  this.alipay_config = alipay_config;
}

/**
 * 针对notify_url验证消息是否是支付宝发出的合法消息
 * @return 验证结果
 */
AlipayNotify.prototype.verifyNotify = function(_POST, callback) {
  if (Object.keys(_POST).length == 0) { //判断POST来的数组是否为空
    callback(false);
  } else {
    //生成签名结果
    var isSign = this.getSignVeryfy(_POST, _POST["sign"]);
    //获取支付宝远程服务器ATN结果（验证是否是支付宝发来的消息）
    var responseTxt = 'true';
    //验证
    //responsetTxt的结果不是true，与服务器设置问题、合作身份者ID、notify_id一分钟失效有关
    //isSign的结果不是true，与安全校验码、请求时的参数格式（如：带自定义参数等）、编码格式有关
    if (null != _POST["notify_id"]) {
      this.getResponse(_POST["notify_id"], function(responseTxt) {
        callback(responseTxt == 'true' && isSign);
      });
    } else {
      callback(responseTxt == 'true' && isSign);
    }
  }
}

/**
 * 针对return_url验证消息是否是支付宝发出的合法消息
 * @return 验证结果
 */
AlipayNotify.prototype.verifyReturn = function(_GET) {

  var self = this;
  return new Promise(function(resolve, reject) {
    if (Object.keys(_GET).length == 0) { //判断POST来的数组是否为空
      reject(false);
    } else {
      //生成签名结果
      var isSign = self.getSignVeryfy(_GET, _GET["sign"]);
      //获取支付宝远程服务器ATN结果（验证是否是支付宝发来的消息）
      var responseTxt = 'true';
      //验证
      //responsetTxt的结果不是true，与服务器设置问题、合作身份者ID、notify_id一分钟失效有关
      //isSign的结果不是true，与安全校验码、请求时的参数格式（如：带自定义参数等）、编码格式有关
      if (null != _GET["notify_id"]) {
        self.getResponse(_GET["notify_id"], function(responseTxt) {
          resolve(responseTxt == 'true' && isSign);
        });
        resolve(responseTxt == 'true' && isSign);
      } else {
        resolve(responseTxt == 'true' && isSign);
      }

    }
  });

}

/**
 * 获取返回时的签名验证结果
 * @param para_temp 通知返回来的参数数组
 * @param sign 返回的签名结果
 * @return 签名验证结果
 */
AlipayNotify.prototype.getSignVeryfy = function(para_temp, sign) {
  //除去待签名参数数组中的空值和签名参数
  var para_filter = core_funcs.paraFilter(para_temp);

  //对待签名参数数组排序
  var para_sort = core_funcs.argSort(para_filter);

  //把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
  var prestr = core_funcs.createLinkstring(para_sort);

  var isSgin = false;

  var sign_type = this.alipay_config['sign_type'].trim().toUpperCase();
  if (sign_type == "MD5") {
    isSgin = md5_f.md5Verify(prestr, sign, this.alipay_config['key']);
  } else {
    isSgin = false;
  }
  return isSgin;
}

/**
 * 获取远程服务器ATN结果,验证返回URL
 * @param notify_id 通知校验ID
 * @return 服务器ATN结果
 * 验证结果集：
 * invalid命令参数不对 出现这个错误，请检测返回处理中partner和key是否为空
 * true 返回正确信息
 * false 请检查防火墙或者是服务器阻止端口问题以及验证时间是否超过一分钟
 */
AlipayNotify.prototype.getResponse = function(notify_id, callback) {
  var transport = this.alipay_config['transport'].trim().toLowerCase();
  var partner = this.alipay_config['partner'].trim();
  var veryfy_url = '';
  if (transport == 'https') {
    veryfy_url = this.https_verify_url;
  } else {
    veryfy_url = this.http_verify_url;
  }
  veryfy_url = veryfy_url + "partner=" + partner + "&notify_id=" + notify_id;

  core_funcs.getHttpResponseGET(veryfy_url, this.alipay_config['cacert'],
    callback);
}

exports.AlipayNotify = AlipayNotify;
