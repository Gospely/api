module.exports = {

	isAuth: false,

	port: 8088,

	isDBAvailable: false,

	sync: false,

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
	}
}
