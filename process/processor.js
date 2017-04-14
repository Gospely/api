//应用创建流程回滚机制
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
					self.excutable = false;
					try {
						yield options.do();
						if (self.next != null) {
							return yield self.next.excute();
						} else {
							return true;
						}
					} catch (e) {
						logger.error(new Date() + "{{#red}} error:"+ self.data +"{{/red}}");
						logger.error(new Date() + "{{#red}} error:"+e.message+"{{/red}}");
						return yield self.rollback();
					}

				} else {
					if (self.last != null) {
						yield self.last.excute();
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
						self.excutable = false;
						yield options.do();
						return yield self.next.excute();
					} catch (e) {
						logger.error(new Date() + "{{#red}} error:"+ self.data +"{{/red}}");
						logger.error(new Date() + "{{#red}} error:"+e.message+"{{/red}}");
						return yield self.rollback();
					} finally {

					}
				} else {
					yield self.rollback();
					if (self.last != null) {

						yield self.last.excute();
					} else {
					}
				}

			},
			rollback: function*() {

				var self = this;
				yield options.undo();
				return false;
			}
		};
	}
}
