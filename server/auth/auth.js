var models = require('../../models')
var assert = require('assert');
var parse = require('co-body');
var co = require('co');
var models = require('../../models');

var config = require('../../configs');

//数据渲染，todo:分页参数引入，异常信息引入
function render(data, code, message) {

	return {
		code: code,
		message: message,
		fields: data
	}
}
module.exports = {

	basicAuth: function* basicAuth(next) {

		console.log("mount");
		console.log(this.url);
		var url = this.url.split("?")[0];
		var method = this.method;


		//基础验证，即验证用户是否已经是登录状态
		//获取token
		var token = this.headers['authorization'];
		console.log(token);
		console.log(excape(url));

		if (method == "OPTIONS") {
			yield next;
		} else {

			//放行
			var replacements = url.split('/');
			if (replacements[1] == 'fs') {
				url = '/fs';
			}
			if (replacements[1] == 'applications') {
				url = '/applications';
			}
			if (excape(url)) {

				console.log("none auth route" + url);
				yield next;
			} else {

				if (method == "GET" || method == "DELETE") {

					var replacements = url.split('/');
					console.log(replacements);
					if (replacements.length >= 3) {
						url = url.replace(replacements[replacements.length - 1], "");

						if (replacements[1] == 'container' || replacements[1] == 'file') {
							url = url + ":" + replacements[1] + "Name";
						} else {
							url = url + ":id";
						}
						console.log(url);
					}

				}
				if (token == null || token == undefined || token == '') {

					console.log("no login");
					this.status = 200
					this.body = render(null, -100, '未登录!');

				} else {

					var code = yield models.gospel_innersessions.findById(token);
					if (code != null && code != undefined) {

						var innersession = yield models.gospel_innersessions.findById(token);

						//todo:权限路由常驻内存
						var privileges = yield models.gospel_privileges.getAll({
							method: method,
							router: url,
						});
						if (privileges.length != 1) {
							//非法url或者权限列表错误
							this.status = 200;
							this.body = render(null, -101, '非法请求');
						} else {

							var pass = false;
							var privilege = privileges[0].dataValues;
							var groups = privilege.groups.split("_")
							for (var i = groups.length - 1; i >= 0; i--) {
								console.log("loop");
								console.log(innersession.group);
								console.log(groups[i]);
								if (innersession.group == groups[i]) {
									pass = true;
									break;
								}
							};
							console.log(pass);
							if (pass) {

								if ((Date.now() - innersession.time) <= innersession.limitTime) {

									yield models.gospel_innersessions.modify({
										id: innersession.id,
										time: Date.now()
									});

									yield next;
								} else {

									yield models.gospel_innersessions.delete(code);
									this.status = 200;
									this.body = render(null, -100, '登录超时!');
								}
							} else {
								//
								this.status = 200;
								this.body = render(null, -100, '无权限操作');
							}
						}


					} else {

						this.status = 200;
						this.body = render(null, -100, '登录超时!');
					}
				}
			}
		}

		function excape(url) {

			var routesNoneAuth = [
				'/users/login', '/users/register',
				'/users/wechat', '/weixin/callback',
				'/alipay/create_direct_pay_by_user/return_url',
				'/alipay/create_direct_pay_by_user/notify_url',
				'/pay/return_url/wxpay', '/users/phone/code', '/users/validator',
				'/applications', '/fs'
			];
			var isHasNoneAuthRoute = false;

			for (var i = routesNoneAuth.length - 1; i >= 0; i--) {
				var currRoute = routesNoneAuth[i];
				if (currRoute == url) {
					isHasNoneAuthRoute = true;
					break;
				}
			};

			return isHasNoneAuthRoute;
		}
	}
}
