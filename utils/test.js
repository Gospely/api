var exec = require('child_process').exec;
var cmd = '../shell/domain.txt';

var fs = require('fs');
var file = fs.readFileSync(cmd, "utf8");
file = file.replace('user','luowenhui').replace('port','8080');
file = file.replace(new RegExp('domain','gm'),"test.gospely.com");
// exec("ssh root@gospely.com " + file,function(error,data){
//   console.log(error);
//   console.log(data);
// });
console.log(file);
console.log(cmd);
