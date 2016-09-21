var controllers = require('./controllers/index.js')();
var models = require('./models');
var reader = require('./utils/reader');


module.exports = function(router) {

	function initControllers(file) {

		var modelsName = file.split(".")[0];
		if(modelsName != "common" && modelsName != "index"){

			router.get("/"+modelsName, controllers.common.list);
			router.get("/"+modelsName+"/:id", controllers.common.detail);
			router.post("/"+modelsName, controllers.common.create);
			router.delete("/"+modelsName+"/:id", controllers.common.delete);
			router.put("/"+modelsName, controllers.common.update);
		}
	}
	router.get('*', function *(next) {
		console.log('ssss');
		yield next;
	})

	//根据controllers下的文件配置单表的增删改差
	reader.readDir(__dirname+"/controllers").map(initControllers);
	router.get("/", controllers.index);

}
