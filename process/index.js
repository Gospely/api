module.exports = {
	buildNext: function(node,options) {

		var temp = node;
		while (null != temp.next) {
				temp = temp.next;
		}

		temp.next = {
			data: options.data,
			excutable: true,
			last: temp,
			next: null,
			excute: function(){

				var self = this;
				if(self.excutable) {
						console.log(self.data);
						self.excutable = false;
						try {
								options.do();
								if(self.next != null){
									self.next.excute();
								}else {
									console.log("finish");
								}
						} catch (e) {
							self.rollback();
						}

				}else{
					if(self.last != null){
							self.last.excute();
					}else{
						console.log("back to begin");
					}
				}

			},
			rollback: function() {
				var self = this;
				if(self.last != null){
					options.undo();
					console.log("test");
					self.last.rollback();
				}else{
					self.rollback();
				}

			}
		};
		return node;
	},
	init: function(options) {

		return {
			data: options.data,
			excutable: true,
			last: null,
			next: null,
			excute: function(){
				var self = this;

				if(self.excutable) {
						console.log(self.data);
						self.excutable = false;
						options.do();
						self.next.excute();
				}else{
					self.rollback();
					if(self.last != null){
							self.last.excute();
					}else{
						console.log("stop");
					}
				}

			},
			rollback: function() {
					console.log('rollback finish');
			}
		};
	}
}
