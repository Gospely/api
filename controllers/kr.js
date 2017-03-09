var shell = require('../shell');
var exec = require('child_process').exec,
	remoteIp = ''
	baseCMD = 'ssh root@' + remoteIp + ' ',
	parse = require('co-body'),
	util = require('../utils.js'),
	request = require('request');

var 
	search = function(page) {
		return new Promise(function(resolve, reject) {
			request.get({
					url: 'http://36kr.com/api/search/articles/运营?page=' + (page || 1) + '&pageSize=40',
					headers: {
			    		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
					}
				},
			    function(error, response, body){
			        if(error) reject(error);
			        resolve(response, body);
			    }
			);
		});
	},

	article = function(id) {
		return new Promise(function(resolve, reject) {
			request.get({url:
					'http://36kr.1com/api/post/5065705/favorite-info?_=' + id
				},
			    function(error, response, body){
			        if(error) reject(error);
			        resolve(response, body);
			    }
			);
		});
	};

var kr = {

	search: function* () {
		var page = this.params.page;

		try {
			var info = yield search(page);
			this.body = info.body;
		}catch(err) {
			this.body = util.resp(500, '读取失败', err.toString());
		}

	},

	article: function* () {
		var id = this.params.id;;

		console.log(id);

		try {
			var info = yield article(id);
			this.body = info.body;
		}catch(err) {
			this.body = util.resp(500, '读取失败', err.toString());
		}		
	}
}

module.exports = kr;
