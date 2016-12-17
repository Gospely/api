var validator = require('validator');

//针对一个对象的校验

exports = module.exports = {

	validate:function(target, regs){

        var messages = new Array()
        regs.map(function(item,index){
            if(!validator.isEmpty(target[item.name])){

                messages.push({
                    name: item.name,
                    message: "值不能为空"
                })
            }
        });
        regs.map(function(item,index){
            if(!validator[item.reg](target[item.name])){

                messages.push({
                    name: item.name,
                    message: item.message
                })
            }
        });
        return messages;
	}
}
