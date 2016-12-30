var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  HTTPS = require('https'),
  querystring = require('querystring'),
  net = require('net'),
  config = require('../../configs');;
/*
 * Recursively merge properties of two objects
 */
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

function Dnspod(params, options) {
  var self = this;
  self.defParams = mergeJSON(config.dnspod.config, params);
  self.defOptions = mergeJSON({
    host: 'dnsapi.cn',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/json',
      'User-Agent': 'Node Dnspod Client/1.0.0'
    }
  }, options);
}

util.inherits(Dnspod, EventEmitter);

Dnspod.prototype.getHostIp = function() {
  var self = this,
    message = '',
    client;

  client = net.connect({
    host: 'ns1.dnspod.net',
    port: 6666
  }, function() {
  }).on('data', function(data) {
    message = data.toString();
    client.end();
  }).on('end', function() {
    process.nextTick(function() {
      self.emit('getHostIp', null, message);
    });
  }).on('error', function(err) {
    self.emit('error', err);
  });
  return self;
};

Dnspod.prototype.request = function(url, params, eventListenerName) {
  var self = this,
    requestCallback,
    postParams,
    postData,
    postOptions,
    req;

  postParams = self.defParams;
  if (params) {
    postParams = mergeJSON(postParams, params);
  }

  postData = querystring.stringify(postParams);

  postOptions = self.defOptions;
  postOptions.path = url;
  postOptions.headers['Content-Length'] = postData.length;

  requestCallback = function(res) {
    var resData = [];
    res.on('data', function(data) {
      resData.push(data);
    }).on('end', function() {
      var jsonData,
        err;
      try {
        jsonData = JSON.parse(resData.join(''));
      } catch (ex) {
        err = ex;
      } finally {
        process.nextTick(function() {
          if (err) {
            self.emit(eventListenerName, new Error('Request failed'));
          } else {
            self.emit(eventListenerName, null, jsonData);
          }
        });
      }
    });
  };

  req = HTTPS.request(postOptions, requestCallback);
  req.on('error', function(err) {
    self.emit('error', err);
  });
  req.write(postData);
  req.end();
  return self;
};

(function() {
  var mapper = config.dnspod.api;

  Object.keys(mapper).forEach(function(key) {
    Dnspod.prototype[key] = (function(key, value) {
      return function(params) {
        return this.request('/' + value, params, key);
      };
    }(key, mapper[key]));
  });

}());

module.exports = Dnspod;
