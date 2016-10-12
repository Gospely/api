
var util = require('./util');
var request = require('request');
var md5 = require('MD5');
var AV = require('leanengine');
var orderLock = {'1':0};
var rechargeLog = AV.Object.extend('rechargeLog');
var redisClient = require('../redis').redisClient;

exports = module.exports = WXPay;

function WXPay() {

	if (!(this instanceof WXPay)) {
		return new WXPay(arguments[0]);
	};

	this.options = arguments[0];
	this.wxpayID = { appid:this.options.appid, mch_id:this.options.mch_id };
};

function JsonSort(json,key){
    console.log(json);
    for(var j=1,jl=json.length;j < jl;j++){
        var temp = json[j],
            val  = temp[key],
            i    = j-1;
        while(i >=0 && json[i][key]>val){
            json[i+1] = json[i];
            i = i-1;
        }
        json[i+1] = temp;

    }
    console.log(json);
    return json;
}

WXPay.mix = function(){

	switch (arguments.length) {
		case 1:
			var obj = arguments[0];
			for (var key in obj) {
				if (WXPay.prototype.hasOwnProperty(key)) {
					throw new Error('Prototype method exist. method: '+ key);
				}
				WXPay.prototype[key] = obj[key];
			}
			break;
		case 2:
			var key = arguments[0].toString(), fn = arguments[1];
			if (WXPay.prototype.hasOwnProperty(key)) {
				throw new Error('Prototype method exist. method: '+ key);
			}
			WXPay.prototype[key] = fn;
			break;
	}
};


WXPay.mix('option', function(option){
	for( var k in option ) {
		this.options[k] = option[k];
	}
});


WXPay.mix('sign', function(param){

//debugger
	//console.log(param);
	var querystring = Object.keys(param).filter(function(key){
		return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(key)<0;
		}).sort();
	//console.log(querystring);
	var realstring='';
	for(var key in querystring)
	{
		realstring += querystring[key] + '=' + param[querystring[key]] + "&";
		//console.log(realstring);
	}
	realstring += "key=" + this.options.partner_key;
	//console.log(realstring);
	//querystring = querystring.map(function(key)
	//					{
	//						console.log(key + '=' + param[key]);
	//						return key + '=' + param[key];
	//					}).join("&")+"&key=" + this.options.partner_key;
	//console.log(realstring);

	//var strTemp = "appid=wxf3633e02a28d60f0&body=有朋充值&mch_id=1364004502&nonce_str=dyYm4EUMFN6tDoTwvjOTHuIAZBSVL8Yq&notify_url=http://asplp.leanapps.cn/pay&out_trade_no=20160719082036&spbill_create_ip=171.113.90.174&total_fee=10&trade_type=APP&key=e3738a2c867cdf51801da9caa5b0b883";
	var opts={encoding: 'utf8'};
	return md5(realstring,opts).toUpperCase();
});


WXPay.mix('createUnifiedOrder', function(opts, fn){

	opts.nonce_str = opts.nonce_str || util.generateNonceString();
	util.mix(opts, this.wxpayID);
	opts.sign = this.sign(opts);

	//console.log("sign:",opts.sign);
	//console.log("xml",util.buildXML(opts));
	//console.log("nonstr:",opts.nonce_str);
	request({
		url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
		method: 'POST',
		body: util.buildXML(opts),
		agentOptions: {
			pfx: this.options.pfx,
			passphrase: this.options.mch_id
		}
	}, function(err, response, body){
		util.parseXML(body, fn);
	});
});

WXPay.mix('getBrandWCPayRequestParams', function(order, fn){

	order.trade_type = "JSAPI";
	var _this = this;
	this.createUnifiedOrder(order, function(err, data){
		var reqparam = {
			appId: _this.options.appid,
			timeStamp: Math.floor(Date.now()/1000)+"",
			nonceStr: data.nonce_str,
			package: "prepay_id="+data.prepay_id,
			signType: "MD5"
		};
		reqparam.paySign = _this.sign(reqparam);
		fn(err, reqparam);
	});
});

WXPay.mix('createMerchantPrepayUrl', function(param){

	param.time_stamp = param.time_stamp || Math.floor(Date.now()/1000);
	param.nonce_str = param.nonce_str || util.generateNonceString();
	util.mix(param, this.wxpayID);
	param.sign = this.sign(param);

	var query = Object.keys(param).filter(function(key){
		return ['sign', 'mch_id', 'product_id', 'appid', 'time_stamp', 'nonce_str'].indexOf(key)>=0;
	}).map(function(key){
		return key + "=" + encodeURIComponent(param[key]);
	}).join('&');

	return "weixin://wxpay/bizpayurl?" + query;
});


WXPay.mix('useWXCallback', function(fn){
	return function(req, res, next)
	{
		//console.log('we chat');
		var _this = this;
		res.success = function(){ res.end(util.buildXML({ xml:{ return_code:'SUCCESS' } })); };
		res.fail = function(){ res.end(util.buildXML({ xml:{ return_code:'FAIL' } })); };

		util.pipe(req, function(err, data)
		{
			var xml = data.toString('utf8');
			//console.log(1);
			util.parseXML(xml, function(err, msg)
			{
				var query = new AV.Query('wechatOrder');
				query.equalTo('tradeNo', msg.out_trade_no);
				var key = 'order,'+msg.out_trade_no;
				var total_fee = msg.total_fee/100;
				//控制访问
				redisClient.incr(key,function( err, id )
				{
					if(id > 1)
					{
						console.log('已经处理过了,不再处理');
						return ;
					}
					redisClient.expire(key, 60);

					var goldNum = 0;
					var Diamond = 0;
					var type = 0;
					//充值日志

	                var log = new rechargeLog();

					query.first().then(function(data)
					{
						if(!data)
						{
							return AV.Promise.error('There was an error.');
						}
						if(data.get('orderState') > 0)
						{
							return AV.Promise.error('已经处理过了,不再处理..');
						}
						//console.log(3);
						gold = data.get('goldNum');
						Diamond = data.get('Diamond');
						type = data.get('type');
						data.increment('orderState', 1);
						data.set('realPay', parseInt(total_fee));
						return data.save();
					}).then(function(data)
					{
						//console.log(4);
						var user = new AV.Query('chatUsers');
						user.equalTo('userID', data.get('userID'));
						return user.first();

					}).then(function(user)
					{
						var vipType = user.get("VIPType");
						var tip = [1.0,1.05,1.08,1.12,1.18,1.25,1.33,1.42,1.52,1.63];
						//console.log(5);

	                    //写一下充值记录
	                    log.set('beforeGold', user.get('goldNum'));
	                    log.set('beforeGoldMax', user.get('goldMax'));
	                    log.set('beforeDiamond', user.get('Diamond'));
	                    log.set('beforeBonus', user.get('BounusPoint'));
	                    log.set('Bounus', parseInt(total_fee));

	                    if((gold && gold >0) ||(Diamond && Diamond > 0))
	                    {
	                    	if (vipType > 0 && total_fee < 300)//购买在300以下
	                    	{
	                          gold *= tip[vipType];
	                          Diamond *= tip[vipType];
	                    	}
	                    	user.increment('goldMax', parseInt(gold));
							//实际支付超过500 额外赠送88
	                    	user.increment('Diamond', parseInt(Diamond) + Math.floor(total_fee/500) * 88);
	                    	console.log("Diamond:"+parseInt(Diamond)+"+"+Math.floor(total_fee/500) * 88);
	                    	user.increment('goldNum',parseInt(gold*5 + Diamond * 100));
	                    }
	                    else
	                    {
	                    	if(type == 1)//充值金币
	                    	{
	                    		gold = total_fee * 100;
	                    		if(total_fee < 300)
	                    		{
	                    			gold *= 1.25;
	                    			gold *= tip[vipType];
	                    		}
	                    		else
	                    		{
	                    			gold *= 2;
	                    		}
	                    		user.increment('goldMax', parseInt(gold));
	                    		user.increment('Diamond', Math.floor(total_fee/500) * 88);
	                    		user.increment('goldNum',parseInt(gold*5));
	                    	}
	                    	else
	                    	{
	                    		Diamond = total_fee;
	                    		if(total_fee < 300)
	                    		{
	                    			Diamond *= 1.25;
	                    			Diamond *= tip[vipType];
	                    		}
	                    		else
	                    		{
	                    			Diamond *= 2;
	                    		}
	                    		user.increment('Diamond', Diamond + Math.floor(total_fee/500) * 88);
	                    		user.increment('goldNum',parseInt(Diamond * 100));
	                    	}
	                    }
	                    user.increment('BonusPoint', parseInt(total_fee));
	                    console.log('userid:'+ user.get('userID')+ 'oldGold:' + user.get('goldNum')+"goldMax:"+gold+"Diamond:"+Diamond);

	                    //记录订单号
	                    log.set('tradeNo', msg.out_trade_no);
	                    //实际支付金额
	                    log.set('money', total_fee);
	                      //记录用户id
	                    log.set('userID', user.get('userID'));
	                      //记录购买物品
	                    log.set('goldMax', gold);
	                    log.set('goldNum', gold*5 + Diamond*100);
	                    log.set('Diamond', Diamond);
	                    log.set('vipType', vipType);
	                    user.fetchWhenSave(true);
						return user.save();
					}).then(function(user)
					{
						//console.log(6);
						//delete global.reqCount.key;
						var retData={return_code:"SUCCESS",return_msg:'OK'};
						var retXml = util.buildXML(retData);
						res.send(retXml);
						log.set('DiamondAfter',user.get('Diamond'));
						log.set('GoldAfter',user.get('goldNum'));
						log.set('goldMaxAfter',user.get('goldMax'));
						log.set('afterBonus', user.get('BounusPoint'));
						return log.save();
					}).catch(function(error)
					{
						console.log('WeChatPay:'+error+"tradeNo:"+msg.out_trade_no);
						//req.wxmessage = msg;
						var retData={return_code:"FAIL",return_msg:'OK'};
						var retXml = util.buildXML(retData);
						//delete global.reqCount.key;
						res.send(retXml);
					});
				});
			});
		});
	};
});


WXPay.mix('queryOrder', function(query, fn){

	if (!(query.transaction_id || query.out_trade_no)) {
		fn(null, { return_code: 'FAIL', return_msg:'缺少参数' });
	}

	query.nonce_str = query.nonce_str || util.generateNonceString();
	util.mix(query, this.wxpayID);
	query.sign = this.sign(query);

	request({
		url: "https://api.mch.weixin.qq.com/pay/orderquery",
		method: "POST",
		body: util.buildXML({xml: query})
	}, function(err, res, body){
		util.parseXML(body, fn);
	});
});


WXPay.mix('closeOrder', function(order, fn){

	if (!order.out_trade_no) {
		fn(null, { return_code:"FAIL", return_msg:"缺少参数" });
	}

	order.nonce_str = order.nonce_str || util.generateNonceString();
	util.mix(order, this.wxpayID);
	order.sign = this.sign(order);

	request({
		url: "https://api.mch.weixin.qq.com/pay/closeorder",
		method: "POST",
		body: util.buildXML({xml:order})
	}, function(err, res, body){
		util.parseXML(body, fn);
	});
});


WXPay.mix('refund',function(order, fn){
	if (!(order.transaction_id || order.out_refund_no)) {
		fn(null, { return_code: 'FAIL', return_msg:'缺少参数' });
	}

	order.nonce_str = order.nonce_str || util.generateNonceString();
	util.mix(order, this.wxpayID);
	order.sign = this.sign(order);

	request({
		url: "https://api.mch.weixin.qq.com/secapi/pay/refund",
		method: "POST",
		body: util.buildXML({xml: order}),
		agentOptions: {
			pfx: this.options.pfx,
			passphrase: this.options.mch_id
		}
	}, function(err, response, body){
		util.parseXML(body, fn);
	});
});
