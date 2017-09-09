var util = require('../utils.js');
var parse = require('co-body');
var models = require('../models');
var dnspod = require('../server/dnspod');
var shells = require('../shell');

var domains = {};
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
domains.create =  function*() {

  if ('POST' != this.method) this.throw(405, "method is not allowed");
    var domain = yield parse(this, {
      limit: '1kb'
    });
	var application = yield models.gospel_applications.findById(domain.application);
	console.log(application.host);
	console.log("dd");
    ;
    var options = {
        method: 'domainCreate',
        opp: 'domainCreate',
        param: {
              domain: domain.domain,
        }
    }
    var data = yield dnspod.domainOperate(options);
	;
	if(data.status.code == '1') {
		  domain.sub = false;
		  domain.ip = application.host;
		  domain.subDomain = 'www';
		  var inserted = yield models.gospel_domains.create(domain);
		  //添加Nginx配置文件
		  yield shells.domain({
			  user: application.creator,
			  domain: domain.domain,
			  port: application.port,
			  host: application.host,
			  operate: true
		  });
		  //Nginx 加载配置
		  yield shells.nginx({
			  host: application.host
		  });
		  this.body = render(inserted,null,null,1,'添加域名成功');
    }else{
      this.body = render(inserted,null,null,-1, data.status.message +'添加域名失败');
    }


  }
domains.delete = function*() {

    var id = this.params.id;
	console.log('delete');
    var domain = yield models.gospel_domains.findById(id);

	var options = {
      method: 'recordRemove',
      opp: 'recordRemove',
      param: {
            domain: "gospely.com",
            record_id: domain.record
      }
    }
	var result = yield dnspod.domainOperate(options);
	if(!domain.subDomain || domain.subDomain == 'www'){
		options = {
	      method: 'domainRemove',
	      opp: 'domainRemove',
	      param: {
	            domain: domain.domain
	      }
		}
	}
    result = yield dnspod.domainOperate(options);
    if(result.status.code == '1'){

      // var options = {
      //   method: 'recordRemove',
      //   opp: 'recordRemove',
      //   param: {
      //         domain: domain.domain,
      //   }
      // }
      var deleted = yield models.gospel_domains.delete(id);
      this.body = render(result,null,null,1,'删除成功');
    }else{
      this.body = render(result,null,null,-1,result.status.message + ',域名解绑失败');
    }

}
domains.update = function*() {

  if ('PUT' != this.method) this.throw(405, "method is not allowed");
    var item = yield parse(this, {
      limit: '1kb'
    });
	var checkDomains = yield models.gospel_domains.getAll({
		subDomain: item.subDomain
	});
	if(checkDomains.length != 0){

		this.body = render(item,null,null,-1,'该二级域名被占用');
	}else{

		var domains = yield models.gospel_domains.getAll({
			subDomain: item.oldDomain,
			application: item.application,
			record: '245836342'
		});
		if(domains.length == 1){

			var domain = domains[0];
			var options = {
		    method: 'recordRemove',
		    opp: "recordRemove",
		    param: {
		      domain: domain.domain,
		      record_id: domain.record,
		    }
		  }
		  var result = yield dnspod.domainOperate(options);
		  if(result.status.code == '1'){

				var options = {
					method: 'recordCreate',
					opp: 'recordCreate',
					param: {
						domain: domain.domain,
						sub_domain: item.subDomain,
						record_type: 'A',
						record_line: '默认',
						value:  domain.ip,
						mx: '10'
					}
				}
				result = yield dnspod.domainOperate(options);
				if(result.status.code == '1') {
					var inserted = yield models.gospel_domains.modify({
						id: domain.id,
						record: result.record.id,
						subDomain: item.subDomain
					})

					inserted = yield models.gospel_applications.modify({
						id: item.application,
						domain: item.subDomain + "." + domain.domain
					});
					this.body = render(domains,null,null,1,'修改成功');
				}else{
					this.body = render(domains,null,null,1,'修改失败');
				}

		  }else{
		    this.body = render(domains,null,null,-1,result.status.message + ',修改失败');
		  }
		}else{
			this.body = render(domains,null,null,-1," " + ',修改失败');
		}
	}
}
module.exports = domains;
