var exec = require('child_process').exec;
var validator = require('./validator');
var selector = require('./selector');
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
// var options = { name: 'test13',
//   sshPort: 4031,
//   socketPort: 5051,
//   appPort: 5052,
//   password: '111111',
//   memory: '200m'
//  };
// var bash = "ssh root@gospely.com " + "/root/test/allocate/start.js -n " + options.name + " -p " + options.socketPort + " -m " + options.memory + " -s " + options.sshPort + " -a " + options.appPort + " -w " + options.password;
// console.log(bash);
//   exec(bash, function(err,data){
//     console.log(err);
//     console.log(data);
//
//   });

// var target = {
//     email: '31241',
//     price: "11",
//     git: 'https://github.com/chriso/validator.js.git'
// }
// var message = validator.validate(target,[{
//     name: 'email',
//     reg: 'isEmail',
//     message: '邮箱格式错误'
// },{
//     name: 'price',
//     reg: 'isMobilePhone',
//     message: '价格应该是数字类型'
// },{
//     name: 'git',
//     reg: 'isURL',
//     message: '地址非法'
// }]);
// console.log(message);
var result = selector.select([{
    priority: '2',
    name: '1'
},{
    priority: '4',
    name: '2'
},{
    priority: '6',
    name: '3'
},{
    priority: '8',
    name: '4'
}]);
console.log(result);
