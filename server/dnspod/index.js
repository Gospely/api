var Dnspod = require('./dns_client')
var dnspod = new Dnspod();

var client = {};
client.domainOperate = function(options) {

  return new Promise(function(resolve, reject) {
    dnspod[options.method](options.param)
      .on(options.opp, function(err, data) {
        console.log(data);
        if (err) {
          reject(err);
          throw err;
        } else {
          resolve(data);
        }
      });
  });
}
module.exports = client;
