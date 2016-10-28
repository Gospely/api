
var fs = require('fs');
var exec = require('child_process').exec;
var shells = {};

shells.domain = function*(options){
  var file = __dirname + "/domain.txt";
  var cmd = fs.readFileSync(file, "utf8");
  cmd = cmd.replace('user',options.user).replace('port',options.port);
  cmd = cmd.replace(new RegExp('domain','gm'),options.domain);
  var name  = options.domain.replace('-','_');
  cmd = cmd.replace(new RegExp('projectname','gm'),name);
  cmd = cmd.replace(new RegExp('domain','gm'),options.domain);
  console.log(cmd);
  return new Promise(function(resolve, reject) {
    options.user = '';
    cmd = cmd.trim();
      exec("ssh root@gospely.com " + cmd, function(err,data){
        if (err) reject(err);
	      resolve("success");
      });
  });
}
shells.docker = function*(options) {
  console.log(options);
  return new Promise(function(resolve, reject) {
    var bash = "ssh root@gospely.com " + "/root/gospely/allocate/start.js -n " + options.name + " -m "  + options.memory + " -f " + options.file + " -p " + options.socketPort + " -s " + options.sshPort + " -a " + options.appPort + " -w " + options.password + " && echo 'sucess'";
    console.log(bash);
      exec(bash, function(err,data){
        console.log(err);
        console.log(data);
        if (err) reject(err);
	      resolve("success");
      });
  });
}
shells.nginx = function*() {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " service nginx restart && echo 'success'", function(err,data){
      console.log(data);
      console.log(err);
      if (err) reject(err);
      resolve(data);
  });

  })
}
module.exports = shells;
