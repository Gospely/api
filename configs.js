module.exports = {

	isAuth: false,

	port: 8089,

	isDBAvailable: false,

	sync: false,
	cookie:{
		signed: false ,
		expires: new Date(Date.now + 30* 60 * 1000),
		path: "/",
		domain: "gospely.com"
		//domain: "localhost"
	},

	dnspod:{

			config: {
				login_token: "18845,cf418d9ac9fe775becd700e2496c1809",
				format: "json",
				lang: "cn",
				error_on_empty : 'yes'
			},
			api: {
        infoVersion: 'Info.Version',
        userDetail: 'User.Detail',
        userModify: 'User.Modify',
        userpasswdModify: 'Userpasswd.Modify',
        useremailModify: 'Useremail.Modify',
        telephoneverifyCode: 'Telephoneverify.Code',
        userLog: 'User.Log',
        domainCreate: 'Domain.Create',
        domainList: 'Domain.List',
        domainRemove: 'Domain.Remove',
        domainStatus: 'Domain.Status',
        domainInfo: 'Domain.Info',
        domainLog: 'Domain.Log',
        domainSearchenginepush: 'Domain.Searchenginepush',
        domainUrlincn: 'Domain.Urlincn',
        domainshareCreate: 'Domainshare.Create',
        domainshareList: 'Domainshare.List',
        domainshareModify: 'Domainshare.Modify',
        domainshareRemove: 'Domainshare.Remove',
        domainTransfer: 'Domain.Transfer',
        domainLock: 'Domain.Lock',
        domainLockstatus: 'Domain.Lockstatus',
        domainUnlock: 'Domain.Unlock',
        domainaliasList: 'Domainalias.List',
        domainaliasCreate: 'Domainalias.Create',
        domainaliasRemove: 'Domainalias.Remove',
        domaingroupList: 'Domaingroup.List',
        domaingroupCreate: 'Domaingroup.Create',
        domaingroupModify: 'Domaingroup.Modify',
        domaingroupRemove: 'Domaingroup.Remove',
        domainChangegroup: 'Domain.Changegroup',
        domainIsmark: 'Domain.Ismark',
        domainRemark: 'Domain.Remark',
        domainPurview: 'Domain.Purview',
        domainAcquire: 'Domain.Acquire',
        domainAcquiresend: 'Domain.Acquiresend',
        domainAcquirevalidate: 'Domain.Acquirevalidate',
        recordType: 'Record.Type',
        recordLine: 'Record.Line',
        recordCreate: 'Record.Create',
        recordList: 'Record.List',
        recordModify: 'Record.Modify',
        recordRemove: 'Record.Remove',
        recordDdns: 'Record.Ddns',
        recordRemark: 'Record.Remark',
        recordInfo: 'Record.Info',
        recordStatus: 'Record.Status',
        monitorListsubdomain: 'Monitor.Listsubdomain',
        monitorListsubvalue: 'Monitor.Listsubvalue',
        monitorList: 'Monitor.List',
        monitorCreate: 'Monitor.Create',
        monitorModify: 'Monitor.Modify',
        monitorRemove: 'Monitor.Remove',
        monitorInfo: 'Monitor.Info',
        monitorSetstatus: 'Monitor.Setstatus',
        monitorGethistory: 'Monitor.Gethistory',
        monitorUserdesc: 'Monitor.Userdesc',
        monitorGetdowns: 'Monitor.Getdowns'
			}
	},

	mail: {
		host: "smtp.exmail.qq.com", // 主机
	  secureConnection: true, // 使用 SSL
	  port: 465, // SMTP 端口
	  auth: {
	    user: "shark@dodora.cn", // 账号
	    pass: "AIxrslwh1993" // 密码
	  }
	},

	router_config: {
		users: [
			{
				name: '登录',
				method:'post',
				url: '/users/login',
				controller: 'login'
			},
			{
				name: '注册',
				method:'post',
				url: '/users/register',
				controller: 'register'
			},
			{
				name: '修改头像',
				method:'post',
				url: '/users/photo',
				controller: 'updatePhoto'
			},
			,
			{
				name: '邮箱激活',
				method:'get',
				url: '/users/authorization',
				controller: 'authorization'
			},
			{
				name: '微信登录',
				method:'get',
				url: '/users/wechat',
				controller: 'weixinLogin'
			},
		],
		orders: [
			{
				name: '下单',
				method:'post',
				url: '/orders/order',
				controller: 'order'
			}
		],
		fs: [
			{
				name: '读文件',
				method:'get',
				url: '/fs/read/:fileName',
				controller: 'read'
			},
			{
				name: '写文件',
				method:'post',
				url: '/fs/write',
				controller: 'write'
			},
			{
				name: '追加文件',
				method:'post',
				url: '/fs/append/',
				controller: 'append'
			},
			{
				name: '读取文件',
				method:'get',
				url: '/fs/read/:fileName',
				controller: 'read'
			},
			{
				name: '读取文件',
				method:'get',
				url: '/fs/read/:fileName',
				controller: 'read'
			},
			{
				name: '读取文件',
				method:'get',
				url: '/fs/read/:fileName',
				controller: 'read'
			}
		]
	},
	file: {
		basePath: '/image'
	},
}
