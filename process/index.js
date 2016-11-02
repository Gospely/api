var build = require("./node");

var node = build.init({
	do: function() {
		console.log("first do");
	},
	data: 'first data',
	undo: function() {
		console.log("undo first");
	},
})
node = build.buildNext(node, {
	do: function() {
			console.log("second do");
		},
	data: 'second data',
	undo: function() {
		console.log("undo second");
	},
});

node = build.buildNext(node, {
	do: function() {
			console.log("third do");
			throw ("err")
		},
	data: 'third data',
	undo: function() {
		console.log("undo third");
	},
});

node.excute();
