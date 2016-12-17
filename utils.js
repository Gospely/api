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
	},

	randomString: function(randomFlag, min, max) {
		
	    min = min || 8;
	    max = max || 10;
	    randomFlag = randomFlag || false;

	    var str = "",
	        range = min,
	        pos = '',        
	        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	 
	    // 随机产生
	    if(randomFlag){
	        range = Math.round(Math.random() * (max-min)) + min;
	    }
	    for(var i=0; i<range; i++){
	        pos = Math.round(Math.random() * (arr.length-1));
	        str += arr[pos];
	    }

	    return str;

	}
}