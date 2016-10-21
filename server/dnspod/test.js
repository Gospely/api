var Dnspod = require('./dns_client');

var client = new Dnspod();

var getData = function (err, data) {
    console.log(data);
    if (err) {
        throw err;
    } else {
    }
};
// client.recordCreate({
//     domain: 'gospely.com',
//     sub_domain: "test",
//     record_type: 'A',
//     record_line_id: '10=1',
//     value:'120.76.235.234',
//     mx: '10'
// })
//     .on('recordCreate', getData);

var promise = new Promise(function(resolve,reject){

    console.log("promise");
    var fn = client.recordCreate({
        domain: 'gospely.com',
        sub_domain: "succesee",
        record_type: 'A',
        record_line_id: '10=1',
        value:'120.76.235.234',
        mx: '10'
    });
    fn.on('recordCreate',function(err, data){
        console.log(data);
        if (err) {
            reject();
            throw err;
        } else {
          resolve();
        }
    });
});
promise.then(function(){
    console.log(res);
},function(err){
  console.log(res);
})
