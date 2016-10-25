
var fs = require('fs');
var exec = require('child_process').exec;
var shells = {};

shells.domain = function*(options){
  var file = __dirname + "/domain.txt";
  var cmd = fs.readFileSync(file, "utf8");
  cmd = cmd.replace('user',options.user).replace('port',options.port);
  cmd = cmd.replace(new RegExp('domain','gm'),options.domain);
  console.log(cmd);
  return new Promise(function(resolve, reject) {
    options.user = '';
      exec("ssh root@gospely.com " + cmd +" && service nginx restart && echo 'success'", function(err,data){
        if (err) reject(err);
	      resolve(data);
      });
  });
}

module.exports = shells;
