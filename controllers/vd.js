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
        limit: '1024kb'
    });
    page = JSON.parse(page);
    var file = __dirname + "/template.html";
    var template = fs.readFileSync(file, "utf8");
    template = template.replace(/\{title\}/, page.seo.title);
    template = template.replace(/\{description\}/, page.seo.description);
    template = template.replace(/\{head\}/, page.script.head);
    template = template.replace(/\{script\}/, page.script.script);

    file = baseDir + page.key;
    var result = yield writeFile(file,template);
    console.log(template);
    this.body = render(template, 1, result);
}

module.exports = vd;
