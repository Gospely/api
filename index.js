const Koa = require('koa');
const IO = require('koa-socket');
const co = require('co');
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
const app =  new Koa();
const io = new IO();

io.attach(app);

/**
 * Socket middlewares
 * @type {string}
 */
io.use(co.wrap(function *(ctx,next) {
    console.log( 'Socket middleware' );
    const start = new Date;
    yield next();
    const ms = new Date - start;
    console.log( `WS ${ ms }ms` );
}));

io.on('connection',ctx=>{
    console.log('join event',ctx.socket.id);
    io.broadcast('connections',{
        num:io.connections.size
    })
});

io.on( 'disconnect', ctx => {
    console.log( 'leave event', ctx.socket.id );
    io.broadcast( 'connections', {
        num: io.connections.size
    })
});

io.on( 'data', ( ctx, data ) => {
    console.log( 'data event', data );
    console.log( 'ctx:', ctx.event, ctx.data, ctx.socket.id );
    console.log( 'ctx.teststring:', ctx.teststring );
    ctx.socket.emit( 'response', {
        message: 'response from server'
    })
});
io.on( 'ack', ( ctx, data ) => {
    console.log( 'data event with acknowledgement', data )
    ctx.acknowledge( 'received' )
});
io.on( 'numConnections', packet => {
    console.log( `Number of connections: ${ io.connections.size }` )
});

// io.on('join',(ctx,data)=>{
//     var socket_id = ctx.socketIO.socket_id;
//     var user = yield models.gospel_users.findById(userId);
//     user.socket_id = socket_id;
//     yield models.gospel_users.modify({
//         id: user.id,
//         socket_id: socket_id
//     });
//     this.emit('join',{
//         numUsers : numUsers
//     });
// });


process.env.TZ = 'Asia/Shanghai';
app.use(function*(next) {
  try {
    global.appDomain = 'http://localhost:8089';
    global.dashDomain = 'http://localhost:8088';

     // /var/www/yonghuid/xiangmuming
    // global.appDomain = 'http://api.gospely.com'
    // global.dashDomain = 'http://dash.gospely.com'
    yield next;
  } catch (err) {
    this.status = 200;
    this.body = {code: -1, message: '服务器忙请重试：' + err.message };
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

const options = {
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





