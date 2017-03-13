var request = require('request');
var config = require('./config');
var qs = require('querystring')
module.exports = function(options) {

  function mergeJSON(obj1, obj2) {
    if (obj2) {
      Object.keys(obj2).forEach(function(p) {
        try {
          // Property in destination object set; update its value.
          if (obj2[p].constructor === Object) {
            obj1[p] = mergeJSON(obj1[p], obj2[p]);
          } else {
            obj1[p] = obj2[p];
          }
        } catch (e) {
          // Property in destination object not set; create it and set its value.
          obj1[p] = obj2[p];
        }
      });
    }
    return obj1;
  }


  var form = mergeJSON(config, options);
  var url = 'http://sms.253.com/msg/send?' + qs.stringify(form);
  request.get({
      url: url
    },
    function(err, httpResponse, body) {
        console.log(body);
    });
}
