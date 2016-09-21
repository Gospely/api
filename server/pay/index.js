var wechat = require('./wechat');
var alipay = require('./alipay');

module.exports = function (type){
  console.log('test');
  return function* (next){

      if(type === 'wechat'){
        console.log('wechat');
      }else if(type === 'alipay'){
        console.log('alipay');
      }

      yield next;
      console.log('type');
  }
}
