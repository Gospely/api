var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
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
      options.memory + " -c " + options.creator + " -f " + options.file +
      " -p " + options.socketPort +
      " -s " + options.sshPort + " -a " + options.appPort + " -w " +
      options.password + " -o " + options.hostName + " && echo 'sucess'";
    console.log(bash);
    exec(bash, function(err, data) {
      console.log(err);
      console.log(data);
      if (err) reject(err);
      resolve("success");
    });
  });
}

shells.gitClone = function*(options){
  console.log(options);
  return new Promise (function(resolve,reject){
    var bash_rm = "ssh root@gospely.com docker exec gospel_project_"+options.docker+" rm -rf /root/workspace";
    var bash_clone = "ssh root@gospely.com docker exec gospel_project_"+options.docker+" git clone "+options.gitURL +" /root/workspace";
    //执行删除命令
    exec(bash_rm,function(err,data){
      console.log(err);
      console.log(data);
      if(err)reject(err);
      //执行clone命令
        exec(bash_clone,function(err,data){
          console.log(err);
          console.log(data);
          if(err)reject(err);
            resolve("success");
        })
    });
  })
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
    var bash = '';
    console.log(options);
    if (options.type == 'mysql') {
      bash =
        'docker run -p ' + options.port + ':3306  --name ' + options.dbName +
        ' -v /var/www/storage' + options.user +
        '/dbs/mysql:/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD="' +
        options.password + '" -d mariadb';
    }
    if (options.type == 'mongodb') {
      bash =
        'docker run -d -p ' + options.port + ':27017 -p ' + options.httpPort +
        ':28017 --name ' + options.dbName + ' -e MONGODB_PASS="' +
        options.password +
        '" tutum/mongodb'
    }
    if (options.type == 'postgres') {
      bash = 'docker run -p ' + options.port +
        ':5432 --name ' + options.dbName +
        ' -e POSTGRES_PASSWORD=' + options.password + ' -d postgres'
    }
    console.log(bash);
    exec("ssh root@gospely.com " + bash + " && echo success",
      function(err, data) {
        console.log(data);
        console.log(err);
        if (err) reject(err);
        resolve(data);
      });
  })
}
shells.exposePort = function*(options) {
  return new Promise(function(resolve, reject) {
    exec(
      "ssh root@gospely.com  sh /root/gospely/delploy/shell/docker_expose.sh " +
      options.docker + " add " + options.dockerPort + ":" + options.port,
      function(err,
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
    exec("ssh root@gospely.com " + " docker stop " + options.docker +
      " && echo success",
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
    exec("ssh root@gospely.com " + " docker restart " + options.docker +
      " && echo success",
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
    exec("ssh root@gospely.com " + " docker stop " + options.docker +
      " && echo success",
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


  yield this.stopDB(options);

  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " docker rm -f " + options.docker +
      " && echo success",
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
  //读取数据卷大小
shells.volumeInfo = function*(options) {
  return new Promise(function(resolve, reject) {
    exec("ssh root@gospely.com " + " docker exec " + options.docker +
      " df -H",
      function(err, data) {
        if (err)
          reject(err);
        resolve(data);
      })
  });
}

//启动terminal
shells.startTerminal = function(options) {

  console.log("startTerminal");
  exec("ssh root@gospely.com " + " sh /root/startTerminal.sh " + options.docker,
    function(err, data) {
      console.log(err);
      console.log(data);
    });
}

//解压文件
shells.decomFile = function(options){
      	console.log("=======decomDir=======");
	var baseDir = '/var/www/sotrage/code/';
	var comDir = options.comDir;
	var decomDir = path.join(baseDir , options.username , options.projectName);
	return {
		zip:function(){
			console.log("zip");
		  	return new Promise(function(resolve,reject){
		  		exec('ssh root@gospely.com unzip '+comDir+' '+decomDir,function(err,data){
					if (err)
			      			reject(err);
			    		resolve(data);
		  		});
		  	});
		},
		tar:function(){
			console.log("tar")
			return new Promise(function(resolve,reject){
				console.log("promise ,tar");
		  		exec('ssh root@gospely.com tar -zxvf '+comDir+' '+decomDir,function(err,data){
					if (err)
			      			reject(err);
			    		resolve(data);
		  		});
		  	});
		},
		gz:function(){
			console.log("gz")
			return new Promise(function(resolve,reject){
		  		exec('ssh root@gospely.com gzip -d '+comDir+' '+decomDir,function(err,data){
					if (err)
			      			reject(err);
			    		resolve(data);
		  		});
		  	});
		},
		rar:function(){
			console.log("rar")
			return new Promise(function(resolve,reject){
		  		exec('ssh root@gospely.com rar x '+comDir+' '+decomDir,function(err,data){
					if (err)
			      			reject(err);
			    		resolve(data);
		  		});
		  	});
		},
	};
}

module.exports = shells;
