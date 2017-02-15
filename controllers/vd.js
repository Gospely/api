var util = require('../utils.js'),
    fs = require('fs'),
    baseDir = '/var/www/storage/codes/',
    vd = {};

function render(data, code, messge) {

	return {
		code: code,
		message: messge,
		fields: data
	}
}

writeFile = function(fileName, content) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(fileName, content, function(error) {
            if (error) {
                reject(error);
            };
            resolve();
        });
    });
},
vd.create = function*(){

    if ('POST' != this.method) this.throw(405, "method is not allowed");
    var page = yield parse(this, {
        limit: '1kb'
    });

    page = JSON.parse(page);

    
}

module.exports = vd;
