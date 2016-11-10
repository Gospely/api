module.exports = {
	buildNext: function(node, options) {

		var temp = node;
		while (null != temp.next) {
			temp = temp.next;
		}

		temp.next = {
			data: options.data,
			excutable: true,
			last: temp,
			next: null,
			excute: function*() {

				var self = this;
				if (self.excutable) {
					console.log(self.data);
					self.excutable = false;
					try {
						console.log('do');
						yield options.do();
						if (self.next != null) {
							return yield self.next.excute();
						} else {
							console.log("finish");
							return true;
						}
					} catch (e) {

						console.log(e);
						return yield self.rollback();
					}

				} else {
					if (self.last != null) {
						yield self.last.excute();
					} else {
						console.log("back to begin");
					}
				}

			},
			rollback: function*() {
				var self = this;
				yield options.undo();
				if (self.last != null) {

					yield self.last.rollback();
				} else {
					yield self.rollback();
				}
				return false;
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
			excute: function*() {
				var self = this;

				if (self.excutable) {

					try {
						console.log(self.data);
						self.excutable = false;
						yield options.do();
						return yield self.next.excute();
					} catch (e) {
						console.log(e);
						return yield self.rollback();
					} finally {

					}
				} else {
					yield self.rollback();
					if (self.last != null) {

						yield self.last.excute();
					} else {
						console.log("stop");
					}
				}

			},
			rollback: function*() {

				var self = this;
				yield options.undo();
				console.log('rollback finish');
				return false;
			}
		};
	}
}
