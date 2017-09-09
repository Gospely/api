var util = require('../utils.js');
var models = require('../models');
var config = require('../configs');
var parse = require('co-body');
var uuid = require('node-uuid')
var common = require('./common');
var processes = require('../process');
var dnspod = require('../server/dnspod');
var _md5 = require('../utils/MD5');
var shell = require('../shell');
var pay = require('../server/pay');
var validator = require('../utils/validator');
var transliteration = require('transliteration');
var md5_f = require('../utils/MD5');

var applications = {};
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
applications.fast_deploy = function*(application,ctx){

	var image = yield models.gospel_images.findById(application.image);
	if (application.free) {

		var products = application.products;
		delete application['products'];
		delete application['price'];
		delete application['size'];
		delete application['unit'];
		delete application['unitPrice'];
		delete application['free'];

		var inserted = yield models.gospel_applications.create(application);
		inserted.databaseType = application.databaseType;
		yield models.gospel_uistates.create({
			application: inserted.id,
			creator: application.creator,
			status: 1,
			configs: image.defaultConfig
		});
		inserted.products = products;
		var result = yield processes.fast_deploy(inserted);
		if (result) {
			ctx.body = render(inserted, null, null, 1, "应用创建成功");
		} else {
			ctx.body = render(inserted, null, null, -1, "应用创建失败");
			 yield models.gospel_applications.delete(inserted.id);
		}
	} else {
		var orderNo = _md5.md5Sign("gospel", uuid.v4());
		var pay_url = yield pay.wechat.wxpay_pay({
		  body: 'Gospel services', //商品描述,
		  out_trade_no: orderNo, //商户订单号,
		  total_fee: application.price, //金额,
		//   total_fee: order.price * 100, //金额,
		  spbill_create_ip: '127.0.0.1', //终端IP,
		  product_id: '', //商品id 选,
		  detail: 'dodora', //商品详情 选
		  attach: '', //附加数据 选
		  time_start: '', //订单生成时间 yyyyMMddHHmmss  选
		  time_expire: '', //订单失效时间，格式为yyyyMMddHHmmss  选
		  fee_type: '', //货币类型 选
		}, ctx);
		var url = pay.alipay.create_direct_pay_by_user({
		  out_trade_no: orderNo //商户订单号, 商户网站订单系统中唯一订单号，必填
		  ,
		  subject: 'Gospel services' //订单名称 必填
		  ,
		  total_fee: 0.01 //付款金额,必填
		  ,
		  body: "dodora" //订单描述
		  ,
		  show_url: '1' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
		}, ctx);
		application.id = uuid.v4();
		var order = yield models.gospel_orders.create({
			products: application.products,
			orderNo: orderNo,
			name: "付费Docker",
			price: application.price,
			status: 1,
			type: 'docker',
			timeSize: application.size,
			timeUnit: application.unit,
			unitPrice: application.unitPrice,
			creator: application.creator,
			application: application.id,
			alipay: url,
			wechat: pay_url.code_url
		});

		application.orderNo = order.id;
		application.payStatus = -1;
		delete application['products'];
		delete application['price'];
		delete application['size'];
		delete application['unit'];
		delete application['unitPrice'];
		delete application['free'];
		var inserted = yield models.gospel_applications.create(application);
		yield models.gospel_uistates.create({
			application: inserted.id,
			creator: application.creator,
			configs: image.defaultConfig
		});
		ctx.body = render(inserted, null, null, 1, "创建成功, 你选择的是收费配置, 请尽快去支付");
	}
}
applications.deploy = function*(application,ctx) {

	var app = yield models.gospel_applications.findById(application.id);
	if (application.free) {

		app.products = application.products;
		var result = yield processes.app_start(app);
		if (result) {
			var inserted = yield models.gospel_applications.modify({
				id: application.id,
				status: 1,
				products: application.products
			});
			ctx.body = render(inserted, null, null, 1, "部署创建成功");
		} else {
			ctx.body = render(inserted, null, null, -1, "部署创建失败");
		}
	} else {
		var orderNo = _md5.md5Sign("gospel", uuid.v4());
		var pay_url = yield pay.wechat.wxpay_pay({
	      body: 'Gospel services', //商品描述,
	      out_trade_no: orderNo, //商户订单号,
	      total_fee: application.price, //金额,
		//   total_fee: order.price * 100, //金额,
	      spbill_create_ip: '127.0.0.1', //终端IP,
	      product_id: '', //商品id 选,
	      detail: 'dodora', //商品详情 选
	      attach: '', //附加数据 选
	      time_start: '', //订单生成时间 yyyyMMddHHmmss  选
	      time_expire: '', //订单失效时间，格式为yyyyMMddHHmmss  选
	      fee_type: '', //货币类型 选
	    }, ctx);
		var url = pay.alipay.create_direct_pay_by_user({
		  out_trade_no: orderNo //商户订单号, 商户网站订单系统中唯一订单号，必填
		  ,
		  subject: 'Gospel services' //订单名称 必填
		  ,
		  total_fee: 0.01 //付款金额,必填
		  ,
		  body: "dodora" //订单描述
		  ,
		  show_url: '1' //商品展示地址 需以http://开头的完整路径，例如：http://www.xxx.com/myorder.html
		}, ctx);
		var order = yield models.gospel_orders.create({
			products: application.products,
			orderNo: orderNo,
			name: "付费Docker",
			price: application.price,
			status: 1,
			type: 'docker',
			timeSize: application.size,
			timeUnit: application.unit,
			unitPrice: application.unitPrice,
			creator: app.creator,
			application: application.id,
			alipay: url,
			wechat: pay_url.code_url
		});
		var inserted = yield models.gospel_applications.modify({
			id: application.id,
			orderNo: order.id,
			payStatus: -1,
		});
		ctx.body = render(inserted, null, null, 1, "创建成功, 你选择的是收费配置, 请尽快去支付");
	}
}

applications.delete = function*() {


	var id = this.params.id.split('@');
	console.log(id);
	if(id.length == 3) {

		var password = id[1];
		var name = id[2];
		id = id[0];
		var user = yield models.gospel_users.findById(name);
		console.log(user);
		 md5_f.md5Sign(password, 'gospel_users')
		if(user && user.password != md5_f.md5Sign(password, 'gospel_users')) {
			this.body = render(inserted, null, null, -1, '删除失败，密码错误');
			return;
		}
	}else {
		id = id[0];
	}

	var application = yield models.gospel_applications.findById(id);
	var UIState = yield models.gospel_uistates.getAll({
		application: application.id
	});
	console.log(UIState);

	try {
		if(UIState[0].dataValues != null) {
		if(UIState[0].dataValues) {
			UIState = yield models.gospel_uistates.findById(UIState[0].dataValues.id)
			yield models.gospel_uistates.delete(UIState);
		}
	}
	if(application.image == 'wechat:latest'){
		var inserted = yield models.gospel_applications.delete(application.id);
		if (!inserted) {
			this.throw(405, "couldn't be delete.");
		}
		this.body = render(inserted, null, null, 1, '删除成功');
	}else{
		//将中文英语名转英文
		var domain = application.domain;
		var projectFolder = application.docker.replace('gospel_project_','');

			if(domain != null) {
				// var reg = /[\u4e00-\u9FA5]+/;
				// var res = reg.test(domain);
				//
				// if(res){
				// 	var tr = transliteration.transliterate
				// 	domain = tr(domain).replace(new RegExp(" ",'gm'),"").toLocaleLowerCase();
				// }

				//获取应用的二级域名
				var domains = yield models.gospel_domains.getAll({
					subDomain: application.domain,
					sub: true,
				})
				var options = {
					method: 'recordRemove',
					opp: 'recordRemove',
					param: {
						domain: config.dnspod.baseDomain,
						record_id: domains[0].record
					}
				}
				//解绑二级域名
				yield dnspod.domainOperate(options);
				//删除二级域名
				yield models.gospel_domains.delete(domains[0].id);

				var name = domain.replace("-", "_");
				yield shell.stopDocker({
					host: application.host,
					name: application.docker,
				});

				//删除项目文件资源
				setTimeout(function(){
					shell.clearApp({
						fileName: projectFolder,
						user: application.creator,
						host: application.host,
						docker: application.docker,
						nginx: true
					});
				}, 1000)
			}
			//删除docker
	}
	} catch (e) {
			console.log(e);
	} finally {

		var inserted = yield models.gospel_applications.delete(application.id);
		if (!inserted) {
			this.throw(405, "couldn't be delete.");
		}
		this.body = render(inserted, null, null, 1, '删除成功');
	}


}
applications.killPID = function*(){

	var docker = this.query.docker,
		pid = this.query.pid,
		host = this.query.host;
	try {
		yield shell.killPID({
			docker: docker,
			pid: pid,
			host: host
		});
	} catch (e) {
		this.body = render(null, null, null, 1, 'success');
	} finally {

	}
	this.body = render(null, null, null, 1, 'success');
}
//新建应用
applications.create = function*() {

	//用户输入校验
	// var reg = [{
	// 	name: 'name',
	// },{
	// 	name: 'languageType',
	// }];
	// var messages = validator.validate(application,reg);
	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var application = yield parse(this, {
		limit: '10kb'
	});
	if(!application.name){
		application = JSON.parse(application);
	}
	console.log(application);
	var isExit = yield models.gospel_applications.count({
		creator: application.creator,
		name: application.name
	});
	console.log(isExit);
	if(!isExit && isExit[0].all > 0){
		this.body = render(null, null, null, 2, "不要重复创建");
		return;
	};

	var ide = yield models.gospel_ides.getAll({
		creator: application.creator,
	});
	if((ide[0].product === 'common') && (ide[0].dataValues.expireAt || new Date(ide[0].dataValues.expireAt).getTime() < Date.now())) {
		this.body = render(null, null, null, 2, "免费试用期到期，请及时购买授权版本");
		return;
	}
	var count = yield models.gospel_applications.count({
		creator: application.creator,
	});
	console.log(count);
	if(count[0].all >= ide[0].dataValues.count){
		this.body = render(null, null, null, -1, "超出" + ide[0].dataValues.name + "创建数量");
		return ;
	}

	//判断数量
	if(application.id !=null && application.id != undefined && application.id != ''){
		yield applications.deploy(application,this);
	}else {

		if(application.deploy){
			yield applications.fast_deploy(application,this);
		}else{

			if(application.languageType == 'wechat:latest'){
				var image = yield models.gospel_images.findById(application.languageType);
				var inserted = yield models.gospel_applications.create({
					name: application.name,
					image: application.languageType,
					creator: application.creator,
				});
				yield models.gospel_uistates.create({
					application: inserted.id,
					creator: application.creator,
					configs: image.defaultConfig,
					gap: 60 * 1000
				});
				this.body = render(inserted, null, null, 1, "应用创建成功");
			}else{


				var count = yield models.gospel_applications.count({
					creator: application.creator,
					host: '120.76.235.234'
				});
				if(count[0].all >= 10){
					this.body = render(null, null, null, -1, "应用创建失败,封测期间每个用户只能创建1个应用,小程序无限");
					return ;
				}

				var result = yield processes.initDebug(application);

				if (result) {
					this.body = render(result, null, null, 1, "应用创建成功");
				} else {
					this.body = render(result, null, null, -1, "应用创建失败");
				}
			}

		}
	}
}
applications.startTerminal = function*(){
	var containerName = this.query.docker;
	shell.startTerminal({
		docker: containerName
	});
	this.body = render(null, null, null, 1, '启动成功');
}
applications.validate = function*(){

	var name = this.query.name,
		creator = this.query.creator,
    	userName =this.query.userName,
		reg = /[\u4e00-\u9FA5]+/;
	var result = yield models.gospel_applications.getAll({
		name: name,
		creator: creator
	});
	if(result != null && result.length > 0){
		this.body = render(null, null, null, -1, '该应用名已占用');
		return false;
	}
	var res = reg.test(name);

	if (res) {
		var tr = transliteration.transliterate
		name = tr(name).replace(new RegExp(" ", 'gm'), "").toLocaleLowerCase();
	}
	name = name.replace('-', '');
	userName = userName.toLocaleLowerCase();
	var result = yield models.gospel_applications.getAll({
		domain: name + "-" + userName,
		creator: creator
	});
	if(result != null && result.length > 0){
		this.body = render(null, null, null, -1, '该应用名已占用');
	}else{
		this.body = render(null, null, null, 1, null);
	}

}
applications.update = function* update() {

	if ('PUT' != this.method) this.throw(405, "method is not allowed");
	var item = yield parse(this, {
		limit: '4048kb'
	});
	if (item.id == null || item.id == undefined) this.throw(405,
		"method is not allowed");
	var inserted;
	console.log(item);
	if (item.exposePort != null && item.exposePort != undefined && item.exposePort !=
		'') {
		var application = yield models.gospel_applications.findById(item.id);
		if(item.exposePort != application.exposePort){
			var result = yield shell.changePort({
				host: application.host,
				docker: application.docker,
				port: item.exposePort,
				oldPort: application.exposePort
			});
			console.log(result);
			if(result){
				inserted = yield models.gospel_applications.modify(item);
			}
		}
		inserted = yield models.gospel_applications.modify(item);
	}else{
		inserted = yield models.gospel_applications.modify(item);
	}
	if (!inserted) {
		this.throw(405, "couldn't be added.");
	}
	this.body = render(inserted, null, null, 1);
}
applications.startApp = function*(){

	var id = this.params.id;
    var application = yield models.gospel_applications.findById(id);
	console.log(application);
	var cmds = JSON.parse(application.cmds),
		cmd = cmds.default;
	if(application.version != null){
		cmd = cmd;
	}
    var result = yield shell.startApp({
        docker: application.docker,
        host: application.host,
		port: application.port,
		cmd: cmd
    });

	console.log(result);
	if(result == 'success'){

	}
},
applications.stopApp = function*(){

	var id = this.params.id;
    var application = yield models.gospel_applications.findById(id);
	console.log(application);
    var result = yield shell.stopApp({
        docker: application.docker,
        host: application.host,
		port: application.exposePort
    });
	if(result == 'success'){

	}
},
module.exports = applications;
