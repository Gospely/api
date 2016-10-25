var exec = require('child_process').exec;
// var cmd = '../shell/domain.txt';
//
// var fs = require('fs');
// var file = fs.readFileSync(cmd, "utf8");
// file = file.replace('user','luowenhui').replace('port','8080');
// file = file.replace(new RegExp('domain','gm'),"test.gospely.com");
// // exec("ssh root@gospely.com " + file,function(error,data){
// //   console.log(error);
// //   console.log(data);
// // });
// console.log(file);
// console.log(cmd);
// console.log(__dirname);
var options = { name: 'test13',
  sshPort: 4031,
  socketPort: 5051,
  appPort: 5052,
  password: '111111',
  memory: '200m'
 };
var bash = "ssh root@gospely.com " + "/root/test/allocate/start.js -n " + options.name + " -p " + options.socketPort + " -m " + options.memory + " -s " + options.sshPort + " -a " + options.appPort + " -w " + options.password;
console.log(bash);
  exec(bash, function(err,data){
    console.log(err);
    console.log(data);

  });
