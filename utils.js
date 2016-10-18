module.exports = {

	initResp: function(self) {
		var _self = this;
		return {
			resp: function(code, message, fields) {
				self.body = _self.resp(code, message, fields);
			}
		}
	},

	resp: function(code, message, fields) {

		var res = {
			code: code,
			message: message,
			fields: fields
		}

		return res;

	}

}