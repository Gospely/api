var util = require('../utils.js');
var shells = require('../shell');
var portManager = require('../port');
var dbs = {};
dbs.create = function*() {

	var db = yield parse(this, {
		limit: '1kb'
	});

	db.port = yield portManager.generatePort();
	yield shells.buidDB({
		docker: db.docker,
		password: db.password,
	});
	yield shells.exposePort({
		docker: db.docker,
		dockerPort: 3306,
		port: db.port
	});

}

module.exports = dbs;
