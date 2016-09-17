var controllers = require('./controllers/index.js')();

module.exports = function(router) {

	router.get('*', function *(next) {
		console.log('ssss');
		yield next;
	})


		router.get('/', controllers.index);
		router.get('/users', controllers.users.list);
		router.get('/user', controllers.users.show);

}
