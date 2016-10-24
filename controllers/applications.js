var util = require('../utils.js');
var models = require('../models');
var config = require('../configs');
var shells = require('../shell');
var parse = require('co-body');

var applications = {};

applications.create = function*() {

  console.log("create");
  console.log(this);
  if ('POST' != this.method) this.throw(405, "method is not allowed");
    var application = yield parse(this, {
      limit: '1kb'
    });
    console.log(application);
    //应用中文转英文
    var inserted = yield  models.gospel_domains.create({
        domain: application.name + "-" +application.creator,
        ip: '120.76.235.234',
        creator: application.creator
    });

    var port = "8888";
    //需要加判断端口是否占用
    var data = yield shells.domain({
      user: application.creator,
      domain: application.name + "." + config.dnspod.baseDomain,
      port: "8888",
    });
    console.log(data);
    var inserted = yield models.gospel_application.create(application);
}

module.exports = applications;
