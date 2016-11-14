var util = require('../utils.js');

var dbs = {};
dbs.create = function*() {

	var db = yield parse(this, {
		limit: '1kb'
	});

	yield shells.buidDB({
		docker: db.docker,
		password: db.password
	});

}

module.exports = dbs;
