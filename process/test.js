var build = require("./index");
//
// var node = build.init({
// 	do: function() {
// 		console.log("first do");
// 	},
// 	data: 'first data',
// 	undo: function() {
// 		console.log("undo first");
// 	},
// })
// node = build.buildNext(node, {
// 	do: function() {
// 		console.log("second do");
// 	},
// 	data: 'second data',
// 	undo: function() {
// 		console.log("undo second");
// 	},
// });
// node = build.buildNext(node, {
// 	do: function() {
// 		console.log("third do");
// 	},
// 	data: 'third data',
// 	undo: function() {
// 		console.log("undo third");
// 	},
// });
// node = build.buildNext(node, {
// 	do: function() {
// 		console.log("fourth do");
// 	},
// 	data: 'third data',
// 	undo: function() {
// 		console.log("undo fourth");
// 	},
// });
// node.excute();
