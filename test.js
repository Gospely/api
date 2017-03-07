var util = require('./utils.js');

var content = "height: 200%;";
content = content.replace(/height: \d*(%|px);/,"height: " + 100);
console.log(content);
