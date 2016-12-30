var exec = require('child_process').exec;
var port = {};

function genNumber(n, m) {
  var w = m - n;
  return Math.round(Math.random() * w + n)
}


port.generatePort = function*(host) {

  var port = 0;
  var loop = true;
  while (loop) {

    port = genNumber(1024, 49151);
    var data = yield checkBind({
        port: port,
        host: host,
    });
    loop = data.isBind;

  }
  return port;
}

function* checkBind(options) {

    var host = options.host || '120.76.235.234'
    return new Promise(function(resolve, reject) {

        exec("ssh root@"+ host + "  lsof -i:" + options.port, function(err, data) {

          if (err) {
            resolve("{isBind: false}")
          } else {
            resolve("{isBind: true}")
          }

        });

  });
}
module.exports = port
