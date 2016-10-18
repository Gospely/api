var util = require('../utils.js');
var common = require('./common.js');
var reader = require('../utils/reader');
var config = require('../configs');
var inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;


function Controllers(){
}

inherits(Controllers,EventEmitter);

Controllers.prototype.route = function(router){

	reader.readDir(__dirname).map(function(file){

			var self = this;
		 	var modelsName = file.split(".")[0];
      console.log(modelsName);
        //根据controllers下的文件配置单表的增删改查路由
        reader.readDir(__dirname).map(function(file){

           if(modelsName != "common" && modelsName != "index" && modelsName != "fs"){

             router.get("/"+modelsName, common.list);
             router.get("/"+modelsName+"/:id", common.detail);
             router.post("/"+modelsName, common.create);
             router.delete("/"+modelsName+"/:id", common.delete);
             router.put("/"+modelsName, common.update);
           }
        });

		 	var controller = require('./'+modelsName);
			var router_configs=config.router_config;

			//根据路由配置和controller文件动态配置路由 todo:下一版本，准备根据数据库数据生成

			if(router_configs[modelsName] !=null && router_configs[modelsName] != undefined){
				router_configs[modelsName].map(function(router_conf){

						switch (router_conf.method) {
							case 'post':
										router.post(router_conf.url,controller[router_conf.controller]);
										break;
							case 'delete':
										router.delete(router_conf.url,controller[router_conf.controller]);
										break;
							case 'put':
										router.put(router_conf.url,controller[router_conf.controller]);
										break;
							case 'get':
										router.get(router_conf.url,controller[router_conf.controller]);
										break;
							default:
										console.log('default');
						}
				});
			}

	});
}
Controllers.prototype.index = function *(next) {

			this.body = util.resp('200', 'Gospel API List Version 1.0 views');
}

module.exports = Controllers;
