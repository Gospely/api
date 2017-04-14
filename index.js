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
var watcher = require('./server/listener');
var path = require('path');
var logRecord = require('koa-logs-full');
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var fs =  require('fs')


var test = 'test';
const app =  new Koa();
// const io = new IO();

// io.attach(app);
// /**
//  * Socket middlewares
//  * @type {string}
//  */
// app.context.clients = {} ;
// io.use(co.wrap(function *(ctx,next) {
//     const start = new Date;
//     yield next();
//     const ms = new Date - start;
//     console.log( `WS ${ ms }ms` );
// }));
//
// io.on('connection',ctx=>{
//     io.broadcast('connections',{
//         num:io.connections.size
//     })
// });
//
// io.on( 'disconnect', ctx => {
//     io.broadcast( 'connections', {
//         num: io.connections.size
//     })
// });
//
// io.on( 'data', ( ctx, data ) => {
//     ctx.socket.emit( 'response', {
//         message: 'response from server'
//     })
// });
// io.on( 'message', ( ctx, data ) => {
//
//     app.context.clients[data] = ctx.socket;
//     console.log(app.context.clients);
// });
// io.on( 'ack', ( ctx, data ) => {
//     ctx.acknowledge( 'received' )
// });
// io.on( 'numConnections', packet => {
//     console.log( `Number of connections: ${ io.connections.size }` )
// });
// io.on('leave', (ctx, data) => {
//     console.log('leave');
//     delete app.context.clients[data];
// });

app.use(logRecord(app,{
  logdir: path.join(__dirname, 'logs'),
  env: 'product',
  exportGlobalLogger: true
}));
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
    var date = new Date();
    this.logger.error(date + "{{#red}} error:"+ err.message + "{{/red}}");
    this.body = {code: -1, message: '服务器忙出了点问题，请重试' };

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
//文件监听
// watcher.buildListener('/var/www/storage/codes',[/(^|[\/\\])\../,'**/node_modules/**','**/lost+found'], app);
// app.on('error', function(err, ctx) {
//   log.error('server error', err, ctx);
//   this.body = fun.resp('500', err, ctx);
// });
var i = 0;
var setupDb;
if (configs.sync) {
  setupDb = db.sequelize.sync({
    force: true
  });
}

// if (cluster.isMaster) {
//
//     require('os').cpus().forEach(function(){
//         cluster.fork();
//     });
//     cluster.on('exit', function(worker, code, signal) {
//         console.log('worker ' + worker.process.pid + ' died');
//     });
//     cluster.on('listening', function(worker, address) {
//
//         console.log("A worker with #"+worker.id+" is now connected to " +
//         address.address +
//         ":" + address.port);
//     });
// } else {
//     Promise.resolve(setupDb)
//    .then(function() {
//         app.listen(configs.port, function() {
//         console.log('Worker #' + cluster.worker.id + ' make a response');
//           console.log(new Date() +
//             ': gospel api is running, listening on port ' + configs.port);
//         });
//    });
// }
Promise.resolve(setupDb)
.then(function() {
    app.listen(configs.port, function() {
      console.log(new Date() +
        ': gospel api is running, listening on port ' + configs.port);
    });
});
