var app = require('koa.io')();
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
var container = require('./container/index.js');
var mount = require('koa-mount');
var multer = require('koa-multer');
var models = require('./models');


process.env.TZ = 'Asia/Shanghai';
app.use(function*(next) {
  try {
    global.appDomain = 'http://localhost:8089';
    global.dashDomain = 'http://localhost:8088';

      //socket用户id socketid map
      //当前已连接的总人数
    // this.map = {};
    // this.numUsers = 0;
     // /var/www/yonghuid/xiangmuming
    // global.appDomain = 'http://api.gospely.com'
    // global.dashDomain = 'http://dash.gospely.com'
    yield next;
  } catch (err) {
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


app.use(multer({ dest: './uploads/'}));

if (configs.isDBAvailable) {
  app.use(koaPg(configs.db.materDB));
}

var options = {
  headers: ['WWW-Authenticate', 'Server-Authorization', 'Content-Type',
    'Authorization'
  ],
  credentials: true,
  origin: '*'
};
app.use(cors(options));

if (configs.isAuth) {
  app.use(mount('/', auth.basicAuth));
}
app.use(mount('/container', container.filter));
app
  .use(router.routes())
  .use(router.allowedMethods());
console.log(container);

//上传文件模块

app.on('error', function(err, ctx) {
  log.error('server error', err, ctx);
  this.body = fun.resp('500', err, ctx);
});
var setupDb;
if (configs.sync) {
  setupDb = db.sequelize.sync({
    force: true
  });
}

Promise.resolve(setupDb)
  .then(function() {
    app.listen(configs.port, function() {
      console.log(new Date() +
        ': gospel api is running, listening on port ' + configs.port);
    });
  });


app.io.use(function*(next) {
    //join
    //console.log('somebody connected');

    yield* next;

    //exit io.connect(http://ip:8089)
    // if (this.addedUser){
    //   delete app.map[this.userId];
    //   -- app.numUsers
    // }
});



app.io.route('join listen',function* (next,userId) {
    var socket_id = this.socket.id;
    var user = yield models.gospel_users.findById(userId);
    user.socket_id = socket_id;
    yield models.gospel_users.modify({
        id: user.id,
        socket_id: socket_id
    });
    this.emit('join',{
        numUsers : numUsers
    });
});
