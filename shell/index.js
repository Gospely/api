var fs = require('fs');
var exec = require('child_process').exec;
var shells = {};

shells.domain = function*(options) {
  var file = __dirname + "/domain.txt";
  var cmd = fs.readFileSync(file, "utf8");
  cmd = cmd.replace('user', options.user).replace('port', options.port);
  cmd = cmd.replace(new RegExp('domain', 'gm'), options.domain);
  var name = options.domain.replace('-', '_');
  cmd = cmd.replace(new RegExp('projectname', 'gm'), name);
  cmd = cmd.replace(new RegExp('domain', 'gm'), options.domain);
  console.log(cmd);
  return new Promise(function(resolve, reject) {
    options.user = '';
    cmd = cmd.trim();
    exec("ssh root@gospely.com " + cmd, function(err, data) {
      if (err) reject(err);
      resolve("success");
    });
  });
}
shells.docker = function*(options) {
  console.log(options);
  return new Promise(function(resolve, reject) {
    var bash = "ssh root@gospely.com " +
      "/root/gospely/allocate/start.js -n " + options.name + " -m " +
      options.memory + " -f " + options.file + " -p " + options.socketPort +
      " -s " + options.sshPort + " -a " + options.appPort + " -w " +
      options.password + " && echo 'sucess'";
    console.log(bash);
    exec(bash, function(err, data) {
      console.log(err);
      console.log(data);
      if (err) reject(err);
      resolve("success");
    });
  });
}
shells.nginx = function*() {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " +
      " service nginx restart && echo 'success'",
      function(err, data) {
        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });

  })
}
shells.delNginxConf = function*(projectname) {
  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " rm /etc/nginx/conf.d/" + projectname +
      ".gospely.com.conf",
      function(err, data) {
        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });

  })
}

shells.rmDocker = function*(docker) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + "docker rm -f  gospel_project_" +
      docker.name,
      function(err, data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}
shells.stopDocker = function*(docker) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + "docker stop  gospel_project_" +
      docker.name,
      function(err, data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}
shells.rmFile = function*(fileName) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + "rm -rf " + fileName, function(err,
      data) {

      console.log(data);
      console.log(err);
      if (err) reject(err);
      resolve(data);
    });
  })
}
shells.buidDB = function*(options) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + "rm -rf " + fileName, function(err,
      data) {

      console.log(data);
      console.log(err);
      if (err) reject(err);
      resolve(data);
    });
  })
}

//docker db operation

//stop db
shells.stopDB = function*(options) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " docker exec -it " + options.docker +
      "/etc/init.d/mysql stop",
      function(err,
        data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}

//restart
shells.restartDB = function*(options) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " docker exec -it " + options.docker +
      " /etc/init.d/mysql restart ",
      function(err,
        data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}

//start
shells.startDB = function*(options) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " docker exec -it " + options.docker +
      " /etc/init.d/mysql start ",
      function(err,
        data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}

//unstall db
shells.rmDB = function*(options) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " docker exec -it " + options.docker +
      " apt-get remove " + options.db,
      function(err,
        data) {
        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}

//数据卷扩容
shells.extendsVolume = function*(options) {
  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " +
      "  /root/gospely/deploy/extend/extend.js -c " + options.docker +
      " -s " + options.size + " && echo success",
      function(err,
        data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}

//创建数据卷容器
shells.createVolume = function*(options) {
  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " +
      " docker run -itd -v /var/www/storage/" + options.user +
      " --name=docker-volume-" + options.user +
      " ubuntu /bin/bash && echo success",
      function(err,
        data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}

shells.stopVolumeDocker = function*(options) {

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + "docker stop   docker-volume-" +
      options.user + " && echo success",
      function(err, data) {

        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}
module.exports = shells;
