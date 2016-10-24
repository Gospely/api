var exec = require('child_process').exec;
var cmd = '../shell/domain.txt';

var fs = require('fs');
var file = fs.readFileSync(cmd, "utf8");
file = file.replaceAll("${name}",'test.gospely.com');
console.log(file);
console.log(cmd);
