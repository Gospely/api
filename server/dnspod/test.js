var Dnspod = require('./dns_client');

var client = new Dnspod();

var getData = function(err, data) {
  ;
  if (err) {
    throw err;
  } else {}
};
// client.recordCreate({
//     domain: 'gospely.com',
//     sub_domain: "test",
//     record_type: 'A',
//     record_line_id: '10=1',
//     value:'120.79.150.56',
//     mx: '10'
// })
//     .on('recordCreate', getData);

var promise = new Promise(function(resolve, reject) {

  var fn = client.recordCreate({
    domain: 'gospely.com',
    sub_domain: "succesee",
    record_type: 'A',
    record_line_id: '10=1',
    value: '120.79.150.56',
    mx: '10'
  });
  fn.on('recordCreate', function(err, data) {
    ;
    if (err) {
      reject();
      throw err;
    } else {
      resolve();
    }
  });
});

promise.then(function() {
}, function(err,data) {
    ;
    console.log('console.err');
});
