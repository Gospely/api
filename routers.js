var controllers = require('./controllers/index.js')();
var models = require('./models');

module.exports = function(router) {

	router.get('*', function *(next) {
		console.log('ssss');
		yield next;
	})
		router.get("/", controllers.index);
		router.get("/users/", controllers.users.list);
		router.post("/users", controllers.users.create);
		router.delete("/users/:id",controllers.users.remove);
}
