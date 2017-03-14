var util = require('./utils.js');
var fs = require("fs");

var content = "height: 200%;";
content = content.replace(/height: \d*(%|px);/,"height: " + 100);
console.log(content);

console.log(fs.existsSync("/var"));

console.log('http://120.76.235.234:9999/vdsite/download?token=1252b79e-1e6d-418f-a4fd-3d8a18248c09&folder=f0ec0c00-17d1-4593-9d0e-05a71f6fd431/keshihuawangzhan_ivy/&project=%E5%8F%AF%E8%A7%86%E5%8C%96%E7%BD%91%E7%AB%99'.split("?")[1].split('&')[0].split('=')[1]);
console.log(encodeURI('中国'));
