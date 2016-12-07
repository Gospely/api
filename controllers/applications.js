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

applications.create = function*() {


	if ('POST' != this.method) this.throw(405, "method is not allowed");
	var application = yield parse(this, {
		limit: '1kb'
	});
	console.log(application);
	if (application.free) {

		var products = application.products;
		delete application['products'];
		delete application['price'];
		delete application['size'];
		delete application['unit'];
		delete application['unitPrice'];
		delete application['free'];

		var inserted = yield models.gospel_applications.create(application);
		inserted.products = products;
		var result = yield processes.app_start(inserted);
		if (result) {
			this.body = render(inserted, null, null, 1, "创建成功");
		} else {
			this.body = render(inserted, null, null, -1, "创建失败");
		}
	} else {

		application.id = uuid.v4();
		var order = yield models.gospel_orders.create({
			products: application.products,
			orderNo: _md5.md5Sign("gospel", uuid.v4()),
			name: "付费Docker",
			price: application.price,
			status: 1,
			type: 'docker',
			timeSize: application.size,
			timeUnit: application.unit,
			unitPrice: application.unitPrice,
			creator: application.creator,
			application: application.id
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

		this.body = render(inserted, null, null, 1, "创建成功, 你选择的是收费配置, 请尽快去支付");
	}
}

applications.startTerminal = function*() {

	var docker = this.query.docker;
	console.log(docker);
	try {
		var result = shell.startTerminal({
			docker: docker
		});
		this.body = render(result, null, null, 1, '启动成功');
	}catch(err) {
		this.body = render(result, null, null, -1, '启动失败');
	}
}

applications.delete = function*() {


	var id = this.params.id;
	var application = yield models.gospel_applications.findById(id);
	//将中文英语名转英文
	var domain = application.domain;
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
	console.log(domains);
	var options = {
		method: 'recordRemove',
		opp: 'recordRemove',
		param: {
			domain: "gospely.com",
			record_id: domains[0].record
		}
	}

	try {
		//解绑二级域名
		yield dnspod.domainOperate(options);
		//删除二级域名
		yield models.gospel_domains.delete(domains[0].id);

		var name = domain.replace("-", "_");
		//删除nginx配置文件
		yield shells.delNginxConf(name);
		yield shells.nginx();
		//删除docker
		yield shells.stopDocker({
			name: name,
		});
		yield shells.rmDocker({
			name: name,
		});
		//删除项目文件资源
		yield shells.rmFile("/var/www/storage/codes/" + domain)
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
module.exports = applications;
