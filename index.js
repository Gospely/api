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

app.use(logger({
	"filename": "./log_file.log"
}));

locale(app);

app.use(i18n(app, {
  directory: './locales',
  locales: ['zh-cn', 'en-US'],
  modes: [
    'header',
    function() {}
  ]
}))

if(configs.isAuth) {
	app.use(auth({ name: 'tj', pass: 'tobi' }));
}

if(configs.isDBAvailable) {
	app.use(koaPg(configs.db.materDB));
}

app.use(cors({
	headers: ['WWW-Authenticate', 'Server-Authorization'],
	credentials: true
}));

app
  .use(router.routes())
  .use(router.allowedMethods());

app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
  this.body = fun.resp('500', err, ctx);
});

app.listen(configs.port, function () {
  console.log('gospel api is running, listening on port ' + configs.port);
});
