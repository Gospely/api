var util = require('../utils.js');
var fs = require('fs');
var models = require('../models');
var md5_f = require('../utils/MD5');
var parse = require('co-body');
var mail = require('../server/mail/email');
var uuid = require('node-uuid');
var config = require('../configs')
var ccap = require('ccap')(); //Instantiated ccap class
var users = {};
var message = require('../server/message/message')
var shells = require('../shell')


//数据渲染，todo:分页参数引入，异常信息引入
function render(data, code, messge) {

	return {
		code: code,
		message: messge,
		fields: data
	}
}

users.login = function*() {


	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '1kb'
	});
	console.log(user);
	if (user.code_token != null && user.code_token != undefined && user.code_token !=
		'') {
		var innersession = yield models.gospel_innersessions.findById(user.code_token);

		if (innersession.code.toUpperCase() == user.code.toUpperCase()) {
			yield checkPwd(user, this);
		} else {
			this.body = render(null, -1, "验证码错误");
		}
	} else {
		yield checkPwd(user, this);
	}

}

function* checkPwd(user, ctx) {

	delete user['id'];
	delete user['code_token'];
	delete user['code'];
	user.password = md5_f.md5Sign(user.password, 'gospel_users');
	var data = yield models.gospel_users.findAll({
		where: user
	});
	console.log(data.length);
	if (data == null || data == undefined || data.length != 1) {

		console.log("用户名或者密码错误");
		var innersessions = yield models.gospel_innersessions.findAll({
			where: {
				phone: user.phone
			}
		});

		if (innersessions.length != 1) {

			if (innersessions.length == 0) {
				//记录
				yield models.gospel_innersessions.create({
					phone: user.phone,
					time: Date.now(),
					count: 1,
				});
			}
		} else {
			var innersession = innersessions[0].dataValues;
			yield models.gospel_innersessions.modify({
				id: innersession.id,
				time: Date.now(),
				count: innersession.count + 1,
			});
		}
		ctx.body = render(null, -1, "用户名或者密码错误");
	} else {

		var innersessions = yield models.gospel_innersessions.findAll({
			where: {
				phone: user.phone
			}
		});
		if (innersessions.length == 1) {
			var innersession = data[0].dataValues;
			models.gospel_innersessions.delete(innersession);
		}
		var token = uuid.v4();
		console.log("user" + token);
		var user = data[0].dataValues;
		user.password = '';
		user.token = token;
		yield models.gospel_innersessions.create({
			id: token,
			code: token,
			creater: user.id,
			time: Date.now(),
			group: user.group,
			limitTime: 30 * 60 * 1000
		});
		ctx.body = render(user, 1, "登录成功");
		//记录用户的登录，todo:基于redis实现
	}
}

users.logout = function*() {

	var id = this.parms.id;
	models.gospel_innersessions.delete(id);
}

users.register = function*() {

	console.log(this.method);
	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '1kb'
	});
	delete user['id'];
	user.password = md5_f.md5Sign(user.password, 'gospel_users');
	user.type = 'common';
	user.ide = uuid.v4();
	user.ideName = '个人版';
	user.group = 'ab64c397-d323-4133-9541-479bbaaf6c52';


	console.log(user.password);
	var inserted;

	if (user.phone != "") {
		console.log(user);
		var reg =
			/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
		isok = reg.test(user.phone);
		var activeCode = uuid.v4();
		if (isok) {
			console.log(user.phone + "email");

			//判断是否已经注册le
			var data = models.gospel_users.getAll({
				email: user.phone
			});

			if (data.length >= 1) {
				this.body = render(null, -1, "该邮箱已经注册");
			} else {
				// 设置邮件内容
				var active = "http://api.gospely.com/users/authorization?code=" +
					activeCode;
				console.log(active);
				var mailOptions = {

					from: "龙猫科技 <shark@dodora.cn>", // 发件地址
					to: user.phone, // 收件列表
					subject: "Hello world", // 标题
					html: "<a href='" + active + "'>" + active + "</a></br>复制到浏览器访问" // html 内容
				}
				mail(mailOptions);

				var authorization = {
					code: activeCode,
					time: Date.now()
				};
				user.isblocked = 1;
				user.email = user.phone;
				user.phone = '';
				inserted = yield models.gospel_innersessions.create(authorization);

				//创建数据卷
				user.id = uuid.v4();
				user.volumeSize = 10;
				user.volume = "docker-volume-" + user.id;

				inserted = yield models.gospel_users.create(user);
				var result = yield shells.createVolume({
					user: user.id
				});
				this.body = render(user, 1, "注册成功");
			}

		}

		reg = /^1[34578]\d{9}$/;
		isok = reg.test(user.phone);
		console.log(isok);
		if (isok) {

			var token = user.token;
			var authCode = user.authCode;

			var innersession = yield models.gospel_innersessions.findById(token);
			if (innersession.phone == user.phone) {
				if ((Date.now() - innersession.time) <= innersession.limitTime) {

					//更新用户状态
					if (innersession.code == authCode) {

						user.volumeSize = 10;
						user.id = uuid.v4();
						user.volume = "docker-volume-" + user.id;

						inserted = yield models.gospel_users.create(user);
						var result = yield shells.createVolume({
							user: inserted.id
						});
						this.body = render(user, 1, "注册成功");
					} else {
						this.body = render(null, -1, "验证码错误，请重新获取");
					}
				} else {
					this.body = render(null, -1, "验证码超时，请重新获取");
				}
			} else {
				this.body = render(null, -1, "注册失败，手机号或验证码错误");
			}

			console.log(user.phone + "phone");

			//校验验证吗
		}
	}

	if (!inserted) {
		this.throw(405, "register failed");
	} else {

		yield models.gospel_ides.create({
			id: user.ide,
			name: '个人版',
			creator: inserted.id,
			product: '1'
		})

		var token = uuid.v4();
		console.log("user" + token);

		inserted.dataValues.token = token;
		yield models.gospel_innersessions.create({
			id: token,
			code: token,
			creater: inserted.id,
			time: Date.now(),
			group: inserted.group,
			limitTime: 30 * 60 * 1000
		});
		this.body = render(inserted, 1, "注册成功");
		//注册成功
	}
}
users.updatePhoto = function*() {

	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '2MB'
	});

	if (user.id == null || user.id == undefined) this.throw(405,
		"method is not allowed");

	var base64Data = user.photo.replace(/^data:image\/\w+;base64,/, "");
	var dataBuffer = new Buffer(base64Data, 'base64');
	try {
		// yield writeFile(config.file.basePath +  user.id + ".png", dataBuffer);
		// user.photo = "http://api.gospely.com/files/" + user.id;
		var inserted = yield models.gospel_users.modify(user);
		if (!inserted) {
			this.throw(405, "couldn't be added.");
		}
		this.body = util.resp(1, '修改成功', null);
	} catch (err) {
		this.body = util.resp(1, '服务器异常', err.toString());
	}

}

users.authorization = function*() {

	if ('GET' != this.method) this.throw(405, "method is not allowed");

	var data = yield models.gospel_innersessions.getAll(this.query);
	if (data.length != 1) {
		this.body = render(user, -1, "激活失效");
	} else {
		console.log(data[0].dataValues.time - Date.now());
		if ((Date.now() - data[0].dataValues.time) <= data[0].dataValues.limitTime) {

			//更新用户状态
			this.body = render(user, -1, "激活成功");
		} else {
			this.body = render(user, -1, "激活链接超时");
		}
	}
}
users.weixinLogin = function*() {

	var config = yield models.gospel_configs.findById('wechat.login.config');

	var url = "https://open.weixin.qq.com/connect/qrconnect?appid=" + config.appid +
		"&redirect_uri=http://api.gospely.com/weixin/callback&response_type=code&scope=snsapi_login&state=12123#wechat_redirect";

	url = encodeURI(url);
	this.redirect(url);
}

users.authCode = function*() {

	var ary = ccap.get();

	var txt = ary[0];

	var buf = ary[1];
	var token = uuid.v4();
	yield models.gospel_innersessions.create({
		id: token,
		code: txt,
		time: Date.now(),
		limitTime: 2 * 60 * 1000
	});
	var s = "data:image/png;base64," + buf.toString('base64');
	console.log(txt);
	this.body = render({
		token: token,
		buf: s
	}, 1, "激活链接超时");
}

//手机验证码
users.phoneCode = function*() {


	var range = function(start, end) {
		var array = [];
		for (var i = start; i < end; ++i) array.push(i);
		return array;
	};
	var randomstr = range(0, 6).map(function(x) {
		return Math.floor(Math.random() * 10);
	}).join('');

	var phone = this.query.phone;

	var options = {

		mobile: phone,
		msg: '【江西龙猫科技】' + randomstr + '，是您的短信验证码，请在60秒内提交验证码',
		needstatus: false
	}


	message(options);
	var id = uuid.v4();
	var innersession = yield models.gospel_innersessions.create({
		id: id,
		code: randomstr,
		time: Date.now(),
		limitTime: 60 * 1000,
		phone: phone
	})
	this.body = render(id, 1, "获取验证码成功");
}

users.validator = function*() {

	var user = this.query;
	console.log(user);
	var data = yield models.gospel_users.findAll({
		where: user
	});

	if (data.length != 0) {
		this.body = render(null, -1, "已被注册");
	} else {
		this.body = render(null, 1, "");
	}

}
users.getEmailCode = function*() {

	var range = function(start, end) {
		var array = [];
		for (var i = start; i < end; ++i) array.push(i);
		return array;
	};
	var randomstr = range(0, 6).map(function(x) {
		return Math.floor(Math.random() * 10);
	}).join('');

	var email = this.query.email;

	var mailOptions = {

		from: "龙猫科技 <shark@dodora.cn>", // 发件地址
		to: user.phone, // 收件列表
		subject: "Hello world", // 标题
		html: "你的验证码是" + randomstr // html 内容
	}
	mail(mailOptions);


}
users.volume = function*() {
	var user = yield models.gospel_users.findById(this.params.id);
	console.log(user);
	var result = yield shells.volumeInfo({
		docker: user.volume
	});
	result = result.split('\n');
	result = result[1].split(" ");
	result = {
		name: result[0],
		size: result[2],
		used: result[4],
		used_perccent: result[9]
	}
	this.body = render(result, 1, 'success');
}
users.files = function*() {

	var fileName = this.params.file;
	try {
		if (fileName != null && fileName != undefined && fileName != '') {

			fileName = fileName + ".png";
			console.log(fileName);
			var bitmap = yield readFile(config.file.basePath + fileName);
			var buf = base64_encode(bitmap);
			console.log(buf);
			this.body = buf;
		}
	} catch (e) {
		console.log(e);
	} finally {

	}

}

readFile = function(fileName) {
		return new Promise(function(resolve, reject) {
			fs.readFile(fileName, {
				flag: 'r+',
				encoding: 'utf8'
			}, function(error, data) {
				if (error) reject(error);
				resolve(data);
			});
		});
	},

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
	base64_encode = function(bitmap) {
		// read binary data
		console.log("ss");
		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');
	}
module.exports = users;
