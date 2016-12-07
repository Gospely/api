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
var date = require('../utils/dateOpr');


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

//产生随机数
var range = function(start, end) {
	var array = [];
	for (var i = start; i < end; ++i) array.push(i);
	return array;
};

//获取6位随机数码
var randomstr = function(){
	return range(0, 6).map(function(x) {
		return Math.floor(Math.random() * 10);
	}).join('');
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
		if (isok) {
			console.log(user.phone + "email");

			//判断是否已经注册了
			var data = models.gospel_users.getAll({
				email: user.phone
			});

			if (data.length >= 1) {
				this.body = render(null, -1, "该邮箱已经注册");
			} else {
				// 设置邮件内容
				var activeCode = randomstr();
				var mailOptions = {

					from: "龙猫科技 <shark@dodora.cn>", // 发件地址
					to: user.phone, // 收件列表
					subject: "Hello world", // 标题
					html: "你的验证码是<b>" + activeCode+"</b> ,请在10分钟之内提交验证码" // html 内容
				}
				mail(mailOptions);

				var id = uuid.v4();
				var authorization = {
					id: id,
					code: activeCode,
					phoe: user.mail,
					time: Date.now(),
					limitTime:60*10000,//10分钟的过期时间
				};
				//user.isblocked = 1;
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

	var data = yield models.gospel_innersessions.findById(this.query.code);
	console.log(data);
	console.log(data.time - Date.now());
	if ((Date.now() - data.time) <= data.limitTime) {

		//更新用户状态
		this.body = render(user, -1, "激活成功");
	} else {
		this.body = render(user, -1, "激活链接超时");
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
//验证手机验证码
users.verifyPhoneCode=function*(){
	var user = yield parse(this, {
		limit: '2MB'
	});
	var token = user.token;
	var authCode = user.authCode;

	var innersession = yield models.gospel_innersessions.findById(token);
	if (innersession.phone == user.phone) {
		if ((Date.now() - innersession.time) <= innersession.limitTime) {
			//更新用户状态
			if (innersession.code == authCode) {
				yield models.gospel_users.modify({phone:user.phone,id:user.id});
				this.body = render(user, 1, "手机 验证成功");
			} else {
				this.body = render(null, -1, "验证码错误，请重新获取");
			}
		} else {
			this.body = render(null, -1, "验证码超时，请重新获取");
		}
	} else {
		this.body = render(null, -1, "注册失败，手机或验证码错误");
	}
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

//发送邮箱验证码
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
		to: email, // 收件列表
		subject: "Hello world", // 标题
		html: "你的验证码是" + randomstr+" ,请在一个小时之内提交验证码" // html 内容
	}
	mail(mailOptions);

	var id = uuid.v4();
	var innersession = yield models.gospel_innersessions.create({
		id: id,
		code: randomstr,
		time: Date.now(),
		limitTime: 60 * 60000,//一个小时的过期时间
		phone: email
	})
	this.body=render(id,1,"发送邮箱验证码成功");
}
//验证邮箱验证码
users.verifyEmailCode = function* (){
	var user = yield parse(this, {
		limit: '2MB'
	});
	var token = user.token;
	var authCode = user.authCode;

	var innersession = yield models.gospel_innersessions.findById(token);
	if (innersession.phone == user.phone) {
		if ((Date.now() - innersession.time) <= innersession.limitTime) {
			//更新用户状态
			if (innersession.code == authCode) {
				yield models.gospel_users.modify({email:user.phone,id:user.id});
				this.body = render(user, 1, "邮箱验证成功");
			} else {
				this.body = render(null, -1, "验证码错误，请重新获取");
			}
		} else {
			this.body = render(null, -1, "验证码超时，请重新获取");
		}
	} else {
		this.body = render(null, -1, "注册失败，邮箱或验证码错误");
	}
}

users.volume = function*() {
	var user = yield models.gospel_users.findById(this.params.id);
	console.log(user);
	var result = yield shells.volumeInfo({
		docker: user.volume
	});
	console.log(result);
	result = result.split('\n');
	console.log(result);
	result = result[1].split("  ");

	result = {
		name: result[0],
		size: result[1],
		used: result[2],
		used_perccent: result[4]
	}
	this.body = render(result, 1, 'success');
}


users.chartOrdersCount = function* () {

	var payOrder =  yield models.gospel_orders.orders_count({status:2});//已支付订单数
	payOrder=payOrder[0];
	var unpayOrder = yield models.gospel_orders.orders_count({status:1});//未支付订单数
	unpayOrder = unpayOrder[0];

	//已支付订单
	var payDate = [];
	for (var i = 0; i < 3; i++) {
		payDate[i]=[];
		for (var j = 0; j< 7;j++) {
			payDate[i][j]=0
		}
	}
	console.log(payOrder);
	for (var i = 0; i < payOrder.length; i++) {
		if(payOrder[i].type=='app'){
			date.getDateArr(payOrder[i].str,parseInt(payOrder[i].count),payDate[0]);
		}
		if(payOrder[i].type=='ide'){
			date.getDateArr(payOrder[i].str,parseInt(payOrder[i].count),payDate[1]);
		}
		if(payOrder[i].type=='volume'){
			date.getDateArr(payOrder[i].str,parseInt(payOrder[i].count),payDate[2]);
		}
	}

	//未支付订单
	var unpayDate = [];
	for (var i = 0; i < 3; i++) {
		unpayDate[i]=[];
		for (var j = 0; j< 7;j++) {
			unpayDate[i][j]=0
		}
	}
	console.log(unpayOrder);
	for (var i = 0; i < unpayOrder.length; i++) {
		if(unpayOrder[i].type=='app'){
			date.getDateArr(unpayOrder[i].str,parseInt(unpayOrder[i].count),unpayDate[0]);
		}
		if(unpayOrder[i].type=='ide'){
			date.getDateArr(unpayOrder[i].str,parseInt(unpayOrder[i].count),unpayDate[1]);
		}
		if(unpayOrder[i].type=='volume'){
			date.getDateArr(unpayOrder[i].str,parseInt(unpayOrder[i].count),unpayDate[2]);
		}
	}
	var dataRes = {};
	dataRes.pay=payDate;
	dataRes.unpay=unpayDate;
	console.log(dataRes);
	this.body = render(dataRes, 1 ,'success');
}

users.chartUsersCount = function* (){
	var userData = yield models.gospel_users.users_count();
	var teamData = yield models.gospel_users.teams_count();
	var data=[];
	for (var i = 0; i < userData[0].length; i++) {
		data.push(userData[0][i]);
	}
	for (var i = 0; i < teamData[0].length; i++) {
		teamData[0][i].type='team';
		data.push(teamData[0][i]);
	}
	var unpayDate = [];
	for (var i = 0; i < 3; i++) {
		unpayDate[i]=[];
		for (var j = 0; j< 7;j++) {
			unpayDate[i][j]=0
		}
	}
	for (var i = 0; i < data.length; i++) {
		if(data[i].type=='common'){
			date.getDateArr(data[i].str,parseInt(data[i].count),unpayDate[0]);
		}
		if(data[i].type=='company'){
			date.getDateArr(data[i].str,parseInt(data[i].count),unpayDate[1]);
		}
		if(data[i].type=='team'){
			date.getDateArr(data[i].str,parseInt(data[i].count),unpayDate[2]);
		}
	}
	console.log(data);
	console.log(unpayDate);
	this.body = render(unpayDate, 1 ,'success');
}

users.dashboardApi = function* (){
	//总用户数
	var userCount = yield models.gospel_users.count({});
	//今日用户数
	var todayUserCount = yield models.gospel_users.today_count();
	//昨日用户数
	var yesterdayUserCount = yield models.gospel_users.yesterday_count();
	//企业用户数
	var companyUserCount = yield models.gospel_users.company_count();
	//付费用户数
	var payUserCount = yield models.gospel_users.pay_count();
	//活跃用户数
	var activeUserCount = yield models.gospel_users.active_count();
	//今日收益
	var todayProfit = yield models.gospel_orders.today_profit();
	//昨日收益
	var yesterdayProfit = yield models.gospel_orders.yesterday_profit();
	//今日新增订单数
	var todayOrder = yield models.gospel_orders.today_orders();
	//昨日新增订单数
	var yesterdayOrder = yield models.gospel_orders.yesterday_orders();
	//应用数
	var appCount = yield models.gospel_applications.count({});
	console.log(appCount);
	//域名数
	var domainCount = yield models.gospel_domains.count({});
	console.log(domainCount);
	//
	var data = [];
	userCount[0].dataValues.count=userCount[0].dataValues.all;
	delete userCount[0].dataValues.all;
	userCount[0].dataValues.type='allUser';
	data.push(userCount[0].dataValues);
	todayUserCount[0][0].type='todayUser';
	data.push(todayUserCount[0][0]);
	yesterdayUserCount[0][0].type='yesterdayUser';
	data.push(yesterdayUserCount[0][0]);
	companyUserCount[0][0].type='companyUser';
	data.push(companyUserCount[0][0]);
	payUserCount[0][0].type='payUser';
	data.push(payUserCount[0][0]);

	todayProfit[0][0].sum=todayProfit.sum==null?0:todayProfit.sum;
	todayProfit[0][0].type='todayProfit';
	data.push(todayProfit[0][0]);
	yesterdayProfit[0][0].sum=yesterdayProfit.sum==null?0:yesterdayProfit.sum;
	yesterdayProfit[0][0].type='yesterdayProfit';
	data.push(yesterdayProfit[0][0]);
	todayOrder[0][0].type='todayOrder';
	data.push(todayOrder[0][0]);
	yesterdayOrder[0][0].type='yesterdayOrder';
	data.push(yesterdayOrder[0][0]);

	appCount[0].dataValues.count=appCount[0].dataValues.all;
	delete appCount[0].dataValues.all;
	appCount[0].dataValues.type='appCount';
	data.push(appCount[0].dataValues);

	domainCount[0].dataValues.count=domainCount[0].dataValues.all;
	delete domainCount[0].dataValues.all;
	domainCount[0].dataValues.type='domainCount';
	data.push(domainCount[0].dataValues);

	this.body = render(data,1,'success');
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
