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
    var file = __dirname + "/template.html";
    var template = fs.readFileSync(file, "utf8");

    page = JSON.parse(page);
    file = baseDir + page.project;
    page = page.page;

    template = template.replace(/\{title\}/, page.seo.title);
    template = template.replace(/\{description\}/, page.seo.description);
    template = template.replace(/\{head\}/, page.script.head);
    template = template.replace(/\{script\}/, page.script.script);


    var result = yield writeFile(file,template);
    this.body = render(result, 1, 'success');
}

module.exports = vd;
