var Dnspod = require('./dns_client');

var client = new Dnspod();

var getData = function (err, data) {
    console.log(data);
    if (err) {
        throw err;
    } else {
    }
};
yield client
    .userDetail({length: 5})
    .on('userDetail', getData);
