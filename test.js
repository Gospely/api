var util = require('./utils.js');
var fs = require("fs");

var content = "height: 200%;";
content = content.replace(/height: \d*(%|px);/,"height: " + 100);
console.log(content);

console.log(fs.existsSync("/var"));
