
exports = module.exports = {
	getFormatDate:function(day){
		var date = new Date();
		if (day != null) {
			date.setDate(date.getDate() + day);
		}
		var seperator1 = "-";
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = year + seperator1 + month + seperator1 + strDate
		return currentdate;
	},
	getDateArr:function(target,count,arr){
		switch(target){
			case this.getFormatDate(0):{
				arr[0]=arr[0]+count;break;
			}
			case this.getFormatDate(-1):{
				arr[1]=arr[1]+count;break;
			}
			case this.getFormatDate(-2):{
				arr[2]=arr[2]+count;break;
			}
			case this.getFormatDate(-3):{
				arr[3]=arr[3]+count;break;
			}
			case this.getFormatDate(-4):{
				arr[4]=arr[4]+count;break;
			}
			case this.getFormatDate(-5):{
				arr[5]=arr[5]+count;break;
			}
			case this.getFormatDate(-6):{
				arr[6]=arr[6]+count;break;
			}
			default:{
				console.log('数据库筛选错误！！');
			}
		}
	}
}