var app = require('koa')();
var router = require('koa-router')();
var routers = require('./routers.js')(router);
var auth = require('./server/auth/auth');
var cors = require('koa-cors');
var configs = require('./configs.js');
var koaPg = require('koa-pg');
var logger = require('koa-logger');
var fun = require('./utils.js');
var locale = require('koa-locale');
var i18n = require('koa-i18n');
var db = require('./models');
var mount = require('koa-mount');

// global.appDomain = 'http://localhost:8089'
// global.dashDomain = 'http://localhost:8088'

global.appDomain = 'http://api.gospely.com'
global.dashDomain = 'http://dash.gospely.com'

app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    console.log('catch');
    console.log(err);
    this.status = err.status || 500;
    this.body = err.message;
    console.log(err.message);
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



if(configs.isDBAvailable) {
	app.use(koaPg(configs.db.materDB));
}

var options = {
	headers: ['WWW-Authenticate', 'Server-Authorization','Content-Type','Authorization'],
	credentials: true,
	origin: '*'
};
app.use(cors(options));

if(configs.isAuth) {
	app.use(mount('/', auth.basicAuth));
}
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
