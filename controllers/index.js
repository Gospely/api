var util = require('../utils.js');
var common = require('./common.js');
var reader = require('../utils/reader');
var models = require('../models');
var config = require('../configs');
var inherits = require('util').inherits,
  EventEmitter = require('events').EventEmitter;


function Controllers() {}

inherits(Controllers, EventEmitter);

Controllers.prototype.route = function(router) {

  reader.readDir(__dirname).map(function(file) {

    var self = this;
    var modelsName = file.split(".")[0];

    if (config.isInit === 1) {
      models.gospel_privileges.build({
        name: modelsName + "根据ID获取信息",
        method: 'DELETE',
        router: "/" + modelsName + "/:id",
        groups: "ab64c397-d323-4133-9541-479bbaaf6c52_100"
      }).save().then(function(res) {}, function(err) {});
      models.gospel_privileges.build({
        name: modelsName + "查询",
        method: 'GET',
        router: "/" + modelsName,
        groups: "ab64c397-d323-4133-9541-479bbaaf6c52_100"
      }).save().then(function(res) {}, function(err) {});
      models.gospel_privileges.build({
        name: modelsName + "根据ID获取信息",
        method: 'GET',
        router: "/" + modelsName + "/:id",
        groups: "ab64c397-d323-4133-9541-479bbaaf6c52_100"
      }).save().then(function(res) {}, function(err) {});
      models.gospel_privileges.build({
        name: modelsName + "新增",
        method: 'POST',
        router: "/" + modelsName,
        groups: "ab64c397-d323-4133-9541-479bbaaf6c52_100"
      }).save().then(function(res) {}, function(err) {});
      models.gospel_privileges.build({
        name: modelsName + "修改",
        method: 'PUT',
        router: "/" + modelsName,
        groups: "ab64c397-d323-4133-9541-479bbaaf6c52_100"
      }).save().then(function(res) {}, function(err) {});
      models.gospel_privileges.build({
        name: modelsName + "数据条数",
        method: 'POST',
        router: "/" + modelsName + "/number",
        groups: "ab64c397-d323-4133-9541-479bbaaf6c52_100"
      }).save().then(function(res) {}, function(err) {});
    }
    //根据controllers下的文件配置单表的增删改查路由
    reader.readDir(__dirname).map(function(file) {

      if (modelsName != "common" && modelsName != "index" &&
        modelsName != "fs") {

        if (common[modelsName].list == null || common[modelsName].list ==
          undefined) {
          router.get("/" + modelsName, common.list);
        } else {
          router.get("/" + modelsName, common[modelsName].list);
        }
        if (common[modelsName].detail == null || common[modelsName].detail ==
          undefined) {
          router.get("/" + modelsName + "/:id", common.detail);
        } else {
          router.get("/" + modelsName + "/:id", common[modelsName].detail);
        }
        if (common[modelsName].create == null || common[modelsName].create ==
          undefined) {
          router.post("/" + modelsName, common.create);
        } else {
          router.post("/" + modelsName, common[modelsName].create);
        }
        if (common[modelsName].update == null || common[modelsName].update ==
          undefined) {
          router.put("/" + modelsName, common.update);
        } else {
          router.put("/" + modelsName, common[modelsName].update);
        }
        if (common[modelsName].delete == null || common[modelsName].delete ==
          undefined) {
          router.delete("/" + modelsName + "/:id", common.delete);
        } else {
          router.delete("/" + modelsName + "/:id", common[modelsName]
            .delete);
        }
        if (common[modelsName].count == null || common[modelsName].count ==
          undefined) {
          router.get("/" + modelsName + "/number", common.count);
        } else {
          router.get("/" + modelsName + "/number", common[modelsName]
            .count);
        }
      }
    });

    var controller = require('./' + modelsName);
    var router_configs = config.router_config;

    //根据路由配置和controller文件动态配置路由 todo:下一版本，准备根据数据库数据生成

    if (router_configs[modelsName] != null && router_configs[modelsName] !=
      undefined) {
      router_configs[modelsName].map(function(router_conf) {


        if (config.isInit === 1) {
          models.gospel_privileges.build({
            name: router_conf.name,
            method: router_conf.method.toUpperCase(),
            router: router_conf.url,
            groups: router_conf.groups
          }).save().then(function(res) {
          }, function(err) {
          });
        }
        switch (router_conf.method) {
          case 'post':
            router.post(router_conf.url, controller[router_conf.controller]);
            break;
          case 'delete':
            router.delete(router_conf.url, controller[router_conf.controller]);
            break;
          case 'put':
            router.put(router_conf.url, controller[router_conf.controller]);
            break;
          case 'get':
            router.get(router_conf.url, controller[router_conf.controller]);
            break;
          default:
        }
      });
    }

  });
}
Controllers.prototype.index = function*(next) {

  this.body = util.resp('200', 'Gospel API List Version 1.0 views');
}

module.exports = Controllers;
