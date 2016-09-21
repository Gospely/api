var app = require('koa')();
var router = require('koa-router')();
var routers = require('./routers.js')(router);
var auth = require('koa-basic-auth');
var cors = require('koa-cors');
var configs = require('./configs.js');
var koaPg = require('koa-pg');
var logger = require('koa-logger');
var fun = require('./utils.js');
var locale = require('koa-locale');
var i18n = require('koa-i18n');
var db = require('./models');
var mount = require('koa-mount');

app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

app.use(logger({
	"filename": "./log_file.log"
}));

locale(app);

// app.use(i18n(app, {
//   directory: './locales',
//   locales: ['zh-cn', 'en-US'],
//   modes: [
//     'header',
//     function() {}
//   ]
// }))

if(configs.isAuth) {
	app.use(mount('/*', auth({ name: 'tobi', pass: 'ferret' })));
}

if(configs.isDBAvailable) {
	app.use(koaPg(configs.db.materDB));
}

var options = {
	headers: ['WWW-Authenticate', 'Server-Authorization'],
	credentials: true,
	origin: '*'
};
app.use(cors(options));

app
  .use(router.routes())
  .use(router.allowedMethods());

app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
  this.body = fun.resp('500', err, ctx);
});
var setupDb;
if (configs.sync) {
    setupDb = db.sequelize.sync({force: true});
}

Promise.resolve(setupDb)
.then(function() {
	app.listen(configs.port, function () {
		console.log( new Date() + ': gospel api is running, listening on port ' + configs.port);
	});
});
