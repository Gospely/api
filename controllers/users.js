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
var selector = require('../utils/selector');



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
	if (data == null || data == undefined || data.length != 1) {

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
		var user = data[0].dataValues;
		user.password = '';
		user.token = token;
		yield models.gospel_innersessions.create({
			id: token,
			code: token,
			creater: user.id,
			time: Date.now(),
			group: user.group,
			limitTime: 24 * 15 * 60 * 60 * 1000
		});
		console.log(user);
		ctx.body = render(user, 1, "登录成功");
		//记录用户的登录，todo:基于redis实现
	}
}

users.logout = function*() {
	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '1kb'
	});
	yield models.gospel_innersessions.delete(id);
	ctx.body = render(user, 1, "");
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

	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '1kb'
	});
	// this.body = render('', 1, "暂不开放注册，2017年3月15日左右开放注册");
	var inserted;

	delete user['id'];
 	user.password = md5_f.md5Sign(user.password, 'gospel_users');
 	user.type = 'common';
 	user.ide = uuid.v4();
 	user.ideName = '个人版';
 	user.group = 'common';
 	var inserted;

 	if (user.phone != "") {

 		var	reg = /^1[34578]\d{9}$/;
 			isok = reg.test(user.phone);
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
 					if (!isok) {
 						user.email = user.phone;
 						user.phone = '';
 					}
 					var hosts = yield models.gospel_hosts.getAll({
 						type: user.type,
 						share: true
 					})
					console.log(hosts);
 					var host = selector.select(hosts);
					console.log(host);
 					user.host = host.ip;
					user.photo = 'data:image/png;base64,R0lGODlhwADAAOYAANDQ0Le3t/z8/NTU1Pv7+8LCwv39/f7+/rKyst/f383NzfT09PX19fn5+bq6usDAwLy8vNjY2L+/v7W1tbi4uOXl5e/v77Ozs8HBwezs7PPz8+np6dra2tPT07a2trS0tNLS0r29vfb29tbW1s/Pz8nJydzc3O3t7eDg4MzMzOLi4sXFxfHx8dXV1d7e3u7u7uTk5MvLy/Dw8MPDw8jIyOPj48TExPj4+Pr6+s7OztnZ2fLy8ujo6NHR0eHh4efn5+vr68bGxvf399fX17u7u8fHx+bm5tvb28rKyr6+vrm5ud3d3f///7GxsQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAADAAMAAAAf/gE2Cg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAwocWItCCgAcUJgAoMABrgIAOqBA0QLACgTzAgx5waSjR48sIkCQRUNFg48fcVSIgbHdBB0EUMrsaCBBAFczOM6UuQMJuyInd+4kkGPVBBhChQKhkG7EgaRJXbQ05YAFVKEiHpzzcRXqj6mjJATtOlPAinI6yEJdUsqBELVC/wVoFUcDLlQSoy6csCuUgYdwE97yHco0VI/BQhOES4t4p2JQE240nnkgyTcPMSfLNDDyUwTNM2t8AwF6pglQIkqjFPDB217VH0V8kgAbZYluH57W9hjC0+fdHUVzKwDcowJPG4ozYdBNgXImETwxUH7gArcBz114ylz85rYRz314es7E4TbsyrV3wvHcuzbnyodIV24ALDbiylMgV74DtwDl5nHyG3AqeJMccAt8MoNyx3WTQ3HRfTLdbgJM4M0EY6lmQICddADcY960sBuInlwwoYYccnPBArA14N4n8KnGgTgzGFDaAbeNciBoMlgnzmGgjVBKACxq1kBn4wyIGP8KpyhRJGI3zFVODP/xdUAHqQQABGIspEhOAU+SdUMRqyBwBF81tKbOBSNkKBQBR/zVygM7QvWCDe9MEEMF7MkkwA85vOiKBBFYNRMDHBRADwIY0AAACAAggYGatjiAAQmPAlAAkgR16umnoIYq6qiklmrqqaimquqqrLbq6quwxirrrLTWauutuOaq66689urrr8AGK+ywxBYrykEAJKvsssw26+yz0EYr7bTUNqvfNhWQp+1uFXBD2rbgggYCN7SFay5iEnST2rnskiVbNxy0Ky9UM3aD37z4oqSoNxrk6y8TGoCD3r/zDgAOBboRzO4BhX2DlMLswiDOAxCzKyX/OBlUHG4G5AShMbhBlJPxx89xXM69JAO3bznZpswtOhBw5zJoBHBazsAza2ZwOghYkLNmFthnzgMJ/2zXAReng7PRau3cjhFMw2UEPB70G/VVGsj5jgQyXy0TAenKs0KVXq92Fj0l2Fi2RwbkWI8CRV99QIP3KKD21QbQjY8NbubcAJ78QBDmzAvYrE8AI8+cgaD9DEC2xgI4LVAIr1V8Qm+fDtA1vgRI/mkACdwtb02Mg0pEAo+HK0ACRKgaQAtWb6tBC6WjWoAJJ+7GgAkryxpCByrIwKMKHWC+66UJ8GCBBYN7tMDyPCRAAgbGFsIoBUJXr/323Hfv/ffghy/+JPjkl2/++einr/767Lfv/vvwxy///PTXb//9+Oev//789z9LIAA7'
 					inserted = yield models.gospel_users.create(user);
 				// 	var result = yield shells.createVolume({
 				// 		user: inserted.id,
 				// 		host: user.host
 				// 	});
 					yield shells.mkdir({
 						user: inserted.id,
 						host: user.host
 					});
 					yield shells.mkdirNginx({
						 user: inserted.id
					     })
 					yield shells.sshKey({
 						user: inserted.id,
 						host: user.host
 					});
 					var sshKey = yield shells.getKey({
 						user: inserted.id,
 						host: user.host
 					});
 					yield models.gospel_users.modify({
 						id: inserted.id,
 						sshKey: sshKey
 					});
					yield models.gospel_innersessions.delete(token);
 					this.body = render(user, 1, "注册成功");
 				} else {
					yield models.gospel_innersessions.delete(token);
 					this.body = render(null, -1, "验证码错误，请重新获取");
 				}
 			} else {
				yield models.gospel_innersessions.delete(token);
 				this.body = render(null, -1, "验证码超时，请重新获取");
 			}
 		} else {
			yield models.gospel_innersessions.delete(token);
 			this.body = render(null, -1, "注册失败，手机号或验证码错误");
 		}
 	}

 	if (!inserted) {
		yield models.gospel_innersessions.delete(token);
 		this.body = render(null, -1, "注册失败,验证码超时");
 	} else {

 		yield models.gospel_ides.create({
 			id: user.ide,
 			name: '个人版',
 			creator: inserted.id,
 			product: 'common'
 		});

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

	this.body = render(null, 1, "合法请求");

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
	this.body = render({
		token: token,
		buf: s
	}, 1, "激活链接超时");
}

//手机验证码
users.phoneCode = function*() {

	// this.body = render('', 1, "暂不开放注册，2017年3月15日左右开放注册");
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

		phone: phone,
		msg: '【Gospel福音计划】' + randomstr + '，是您的短信验证码，请在10分钟内提交验证码',
		rd: false
	}


	message(options);
	var id = uuid.v4();
	var innersession = yield models.gospel_innersessions.create({
		id: id,
		code: randomstr,
		time: Date.now(),
		limitTime: 600 * 1000,
		phone: phone
	})
	this.body = render(id, 1, "获取验证码成功");
}
//验证手机验证码
users.verifyPhoneCode=function*(){
	var user = yield parse(this, {
		limit: '10kb'
	});
	var token = user.token;
	var authCode = user.authCode;

	var innersession = yield models.gospel_innersessions.findById(token);
	if (innersession.phone == user.phone) {
		if ((Date.now() - innersession.time) <= innersession.limitTime) {
			//更新用户状态
			if (innersession.code == authCode) {
				yield models.gospel_users.modify({phone:user.phone,id:user.id});
				this.body = render(user, 1, "修改成功验证成功");
			} else {
				this.body = render(null, -1, "验证码错误，请重新获取");
			}
		} else {
			this.body = render(null, -1, "验证码超时，请重新获取");
		}
	} else {
		this.body = render(null, -1, "修改失败，验证码错误，请重新获取");
	}
}

users.validator = function*() {

	var user = this.query;
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

	// this.body = render('', 1, "暂不开放注册，2017年3月15日左右开放注册");
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

		from: "福音计划<account@dodora.cn>", // 发件地址
		to: email, // 收件列表
		subject: "邮箱验证码", // 标题
		html: "你的验证码是" + randomstr+" ,请在10分钟之内提交验证码" // html 内容
	}
	mail(mailOptions);

	var id = uuid.v4();
	var innersession = yield models.gospel_innersessions.create({
		id: id,
		code: randomstr,
		time: Date.now(),
		limitTime: 10 * 60 * 1000,//一个小时的过期时间
		phone: email
	})
	this.body=render(id,1,"发送邮箱验证码成功");
}

//验证邮箱验证码
users.verifyEmailCode = function* (){
	var user = yield parse(this, {
		limit: '10kb'
	});
	var token = user.token;
	var authCode = user.authCode;

	var innersession = yield models.gospel_innersessions.findById(token);
	if (innersession.phone == user.email) {
		if ((Date.now() - innersession.time) <= innersession.limitTime) {
			//更新用户状态
			if (innersession.code == authCode) {
				yield models.gospel_users.modify({email:user.phone,id:user.id});
				this.body = render(user, 1, "修改邮箱成功");
			} else {
				this.body = render(null, -1, "验证码错误，请重新获取");
			}
		} else {
			this.body = render(null, -1, "验证码超时，请重新获取");
		}
	} else {
		this.body = render(null, -1, "修改失败，邮箱或验证码错误");
	}
}

users.volume = function*() {
	var user = yield models.gospel_users.findById(this.params.id);
	var result = yield shells.volumeInfo({
		docker: user.volume
	});
	result = result.split('\n');
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
	//域名数
	var domainCount = yield models.gospel_domains.count({});
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

users.modify = function*() {

	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '1kb'
	});

	var phone = yield models.gospel_users.getAll({
		phone: user.phone
	});
	var email = yield models.gospel_users.getAll({
		email: user.phone
	});
	if(phone.length != 1 && email.length != 1){
		this.body = render(null, -1, "该账号未注册,请注册");
		return false;
	}
	var id = '';
	if(phone.length == 1) {
		id = phone[0].dataValues.id;
	}else{
		id = email[0].dataValues.id;
	}
	var innersession = yield models.gospel_innersessions.findById(user.token);

	if (innersession.phone == user.phone) {
		if ((Date.now() - innersession.time) <= innersession.limitTime) {

			//更新用户状态
			if (innersession.code == user.authCode) {
				yield models.gospel_users.modify({
					id: id,
					password: md5_f.md5Sign(user.password, 'gospel_users'),
				});
				models.gospel_innersessions.delete(user.token);
				this.body = render(user, 1, "密码修改成功");
			} else {
				this.body = render(null, -1, "验证码错误");
			}
		} else {
			models.gospel_innersessions.delete(user.token);
			this.body = render(null, -1, "邮箱或手机号错误");
		}
	} else {
		models.gospel_innersessions.delete(user.token);
		this.body = render(null, -1, "密码修改失败，手机号或验证码错误");
	}
}
users.files = function*() {

	var fileName = this.params.file;
	try {
		if (fileName != null && fileName != undefined && fileName != '') {

			fileName = fileName + ".png";
			var bitmap = yield readFile(config.file.basePath + fileName);
			var buf = base64_encode(bitmap);
			this.body = buf;
		}
	} catch (e) {
	} finally {

	}

}
//第三方登陆完善信息
users.complete = function*(){

	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var user = yield parse(this, {
		limit: '10kb'
	});
	var users = yield models.gospel_users.getAll({
		name: user.name
	});
	console.log(user);
	if(users.length >= 1) {
		this.body = render(null, -1, "该用户名已被占用");
	}else {

		//初始化第三方授权登陆用户
		user.type = 'common';
    	user.ide = uuid.v4();
    	user.ideName = '个人版';
    	user.group = 'comon';
		var hosts = yield models.gospel_hosts.getAll({
			type: user.type,
			share: true
		})
		var host = selector.select(hosts);
		user.host = host.ip;

		// var result = yield shells.createVolume({
		// 	user: user.id,
		// 	host: user.host
		// });
		yield shells.mkdir({
			user: user.id,
			host: user.host
		});
		yield shells.mkdirNginx({
		 	user: user.id
	    })
		yield shells.sshKey({
			user: user.id,
			host: user.host
		});
		var sshKey = yield shells.getKey({
			user: user.id,
			host: user.host
		});
		yield models.gospel_users.modify({
			id: user.id,
			name: user.name,
			sshKey: sshKey,
			type: user.type,
			group: user.group,
			ide: user.ide,
			ideName: user.ideName,
			host: user.host,
		});
		yield models.gospel_ides.create({
			id: user.ide,
			name: '个人版',
			creator: user.id,
			product: 'common'
		});

		this.body = render(user, 1, "注册成功");
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
		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');
	}
module.exports = users;
