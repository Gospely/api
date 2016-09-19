var controllers = require('./controllers/index.js')();
var models = require('./models');
var reader = require('./utils/reader');


module.exports = function(router) {

	function initControllers(file) {

		var modelsName = file.split(".")[0];
		if(modelsName != "common" && modelsName != "index"){

			router.get("/"+modelsName, controllers[modelsName].list);
			router.get("/"+modelsName+"/:id", controllers[modelsName].detail);
			router.post("/"+modelsName, controllers[modelsName].create);
			router.delete("/"+modelsName+"/:id",controllers[modelsName].delete);
			router.put("/"+modelsName+":id",controllers[modelsName].update);
		}
	}
	router.get('*', function *(next) {
		console.log('ssss');
		yield next;
	})

	reader.readDir(__dirname+"/controllers").map(initControllers);
	router.get("/", controllers.index);



}
