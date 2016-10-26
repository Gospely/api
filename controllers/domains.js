var util = require('../utils.js');
var parse = require('co-body');
var models = require('../models');
var dnspod = require('../server/dnspod');

var domians = {};


module.exports = domians;

//域名绑定
function render(data,all,cur,code,message) {

	return {
		code: code,
		message: message,
		all: all,
		cur: cur,
		fields: data
	}
}
domians.bind =  function*() {

  if ('POST' != this.method) this.throw(405, "method is not allowed");
    var domain = yield parse(this, {
      limit: '1kb'
    });
    console.log(domain);
    var options = {
        method: 'domainCreate',
        opp: 'domainCreate',
        param: {
              domain: domain.domain,
        }
    }
    var data = dnspod.domainOperate(options);

    if(data.status.code == '1') {
      //解析
      var options = {
          method: 'recordCreate',
          opp: 'recordCreate',
          param: {
                domain: domain,
                record_type: 'A',
                record_line: '默认',
                value:  config.dnspod.baseIp,
                mx: '10'
          }
      }
      var result = yield dnspod.domainOperate(options);
      if(result.status.code == '1') {
        var inserted = models.gospel_domains.create(domain);
        render(inserted,null,null,1,'添加域名成功');
      }else{
        render(inserted,null,null,-1, result.status.message +'添加域名失败');
      }
    }else{
      render(inserted,null,null,-1, result.status.message +'添加域名失败');
    }


}
