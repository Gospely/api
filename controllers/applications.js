var util = require('../utils.js');
var models = require('../models');
var config = require('../configs');
var shells = require('../shell');
var parse = require('co-body');
var transliteration = require('transliteration');
var portManager = require('../port')
var common = require('./common')

var applications = {};

applications.create = function*() {

  console.log("create");
  console.log(this);
  if ('POST' != this.method) this.throw(405, "method is not allowed");
    var application = yield parse(this, {
      limit: '1kb'
    });

    //应用中文转英文
    var domain  = application.name;
    var reg = /[\u4e00-\u9FA5]+/;
    var res = reg.test(domain);

    if(res){
      var tr = transliteration.transliterate
      domain = tr(domain);
    }

    var port = yield portManager.generatePort();
    console.log(port + domain);
    var inserted = yield  models.gospel_domains.create({
        domain: domain + "-" +application.creator,
        ip: '120.76.235.234',
        creator: application.creator
    });

    try{
        var data = yield shells.domain({
          user: application.creator,
          domain: domain  + "-" + application.creator + "." + config.dnspod.baseDomain,
          port: port,
        });
        console.log(data);
        if(data == 'success'){
          var inserted = yield models.gospel_applications.create(application);
          this.body = common.render(null,null,null,1,'创建应用成功');
        }else{
          this.body = common.render(null,null,null,-1,'创建应用失败');
        }

    }catch(err){
        console.log(err);
        throw err;
    }
}

module.exports = applications;
