var Dnspod = require('./dns_client')
var dnspod = new Dnspod();

var client ={};
// client.parseDomain = function (options) {
//
//   return new Promise(function (resolve, reject){
//     console.log(options);
//     dnspod[options.method](options.param)
//         .on(options.opp, function (err, data) {
//             console.log(data);
//             if (err) {
//                 reject(err)
//             } else {
//                 resolve(data)
//             }
//         });
//   });
// }

module.exports =  dnspod;
