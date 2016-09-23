var co = require('co');
var request = require('request');


co(function *(){
  var a = yield request.get('http://www.baidu.com');
  console.log(a);

});
