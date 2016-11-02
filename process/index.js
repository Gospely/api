var processes = {};

var data = {};
var nodes = [];
var current = 0;

function Processes(){
	current = 0;
}
Processes.prototype.excute = function* () {

	try {

		if(nodes[current] != null && nodes[current] != undefined){
			nodes[current].do(data[current]);
			current++;

		}else{
			current--;
		}
		yield next;
	} catch (e) {
		yield self.rollback();
		yield self.handlerError(e);
	}
}
processes.handlerError = function(err)* {

	this.body =  {
		code: -1,
		message: err.message,
		all: null,
		cur: null,
		fields: null
	}
}

processes.next = function()*{

}
