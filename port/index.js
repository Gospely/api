var exec = require('child_process').exec;
var models = require('../models');
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
port.generatePorts = function*(host, size) {

    var ports = new Array();
    var port = yield this.generatePort(host);

    for (var i = 0; i < size; i++) {
        var available = true;
        port = yield this.generatePort(host);
        for (var j = 0; j < ports.length; j++) {
            if(port == ports[j]){
                available = false
            }
        }
        // yield data = models.gospel_applications.findAll({
        //     where:{
        //         isDeleted: 0,
        //         $or:[{
        //             port: port + '',
        //         },{
        //             exposePort: port + '',
        //         },{
        //             sshPort: port + '',
        //         },,{
        //             socketPort: port + '',
        //         },,{
        //             dbPort: port + '',
        //         }]
        //     }
        // })
        // if(data.length > 0){
        //     available = false
        // }
        if(available){
            ports.push(port)
        }else{
            i--;
        }
    }
    return ports;
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
