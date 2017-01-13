var util = require('../utils.js');
var models =  require('../models');

var feedbacks = {};
//数据渲染，todo:分页参数引入，异常信息引入
function render(data, all, cur, code, message) {

	return {
		code: code,
		message: message,
		all: all,
		cur: cur,
		fields: data
	}
}
feedbacks.create = function*(){

    if ('POST' != this.method) this.throw(405, "method is not allowed");
	var item = yield parse(this, {
		limit: '10kb'
	});
    var feedback = item
    if(item.email !=null && item.email != undefined){
        item = JSON.parse(item);

    }
    if(feedback.creator != null && feedback.creator != undefined && feedback.creator != ''){

        var user = yield models.gospel_users.findById(feedback.creator);
        if(user !=null ){
            feedback.mail = user.mail;
        }
    }
    var inserted =  yield models.gospel_feedbacks.create(feedback);
    this.body = render(inserted, null, null, 1, '提交成功');

}
module.exports = feedbacks;
