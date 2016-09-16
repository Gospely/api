var util = require('../utils.js');
var users = require('../models/UsersModel.js');

module.exports = {

	get: function *(next) {

		this.body = util.resp('200', this.i18n.__('i18n'), {
			a: users.getOne()
		});

	}
	
}