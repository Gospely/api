module.exports = {

	resp: function(code, message, fields) {

		var res = {
			code: code,
			message: message,
			fields: fields
		}

		return res;

	}

}