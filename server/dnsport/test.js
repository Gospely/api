var Dnspod = require('./dns_client');

var client = new Dnspod();

client
    .userDetail({length: 5})
    .on('userDetail', function (err, data) {
        console.log(data);
        if (err) {
            throw err;
        } else {
        }
    });
