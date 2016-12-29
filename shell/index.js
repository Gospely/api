var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var shells = {};

shells.domain = function*(options) {

    var host = options.host || '120.76.235.234';
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
        exec("ssh root@" + host + " " + cmd, function(err, data) {
            if (err) reject(err);
            resolve("success");
        });
    });
}
shells.docker = function*(options) {

    var host = options.host || '120.76.235.234';
    console.log(options);
    return new Promise(function(resolve, reject) {
        var bash = "ssh root@" + host + ' docker run -itd --volumes-from docker-volume-' + options.creator +
        ' -p ' + config + options.socketPort + ':3000 -p ' + options.appPort +
        ':'+ options.exposePort +' -p ' + options.sshPort + ':22 ' + port +
        ' -h ' + options.hostName +
        ' -w /root/workspace --name="gospel_deploy_' + options.name + '"  gospel-' +
        options.image + " && echo success";
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err) reject(err);
            resolve("success");
        });
    });
},
shells.fast_deploy = function*(options) {
    var host = options.host || '120.76.235.234';
    console.log(options);
    var port = '',
        config = '';
    if(options.db != null && options.db != undefined && options.db != '') {

        config = ' -e "DBUSER=' + options.dbUser + '" -e "DBPASS=' + options.password + '" -e "USERID=' + options.creator + '" ';
        port =  ' -p ' + options.dbPort + ':3306';
        var splits = options.image.split(":");
        if(options.db == 'mysql') {
            options.image =  splits[0] + "-mariadb:" + splits[1];
        }else{
            options.image = options.image + "-" + options.db;
        }
    }

  return new Promise(function(resolve, reject) {
      var bash = "ssh root@" + host + ' docker run -itd --volumes-from docker-volume-' + options.creator + ' -m ' + options.memory +
        ' -v /var/www/storage/codes/' + options.creator + "/" + options.name +
        ':/root/workspace -v /var/www/storage/codes/' + options.creator + '/.ssh:/root/.ssh'  + config + ' -p ' + options.socketPort + ':3000 -p ' + options.appPort  +
        ':80 -p ' + options.sshPort + ':22 ' + port +
        ' -h ' + options.hostName +
        ' -w /root/workspace --name="gospel_project_' + options.name + '"  gospel-' +
        options.image + " && echo success";
      console.log(bash);
      exec(bash, function(err, data) {
          console.log(err);
          console.log(data);
          if (err) reject(err);
          resolve("success");
      });
  });
}
shells.mvFiles = function*(options){
    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' sh /root/gospely/deploy/shell/mv.sh gospel_project_' + options.name,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
shells.initDebug = function*(options){

    var host = options.host || '120.76.235.234';
    var port = '',
        config = '';
    if(options.db != null && options.db != undefined && options.db != '') {
        config = ' -e "DBUSER=' + options.dbUser + '" -e "DBPASS=' + options.password + '" -e "USERID=' + options.creator + '" ';
        port =  ' -p ' + options.dbPort + ':3306';
        var splits = options.image.split(":");
        if(options.db == 'mysql') {
            options.image =  splits[0] + "-mariadb";
        }else{
            options.image = options.image + "-" + options.db;
        }
        options.image = options.image + ":" + options.version;
    }
    if(options.framework ==null || options.framework == undefined || options.framework == ''){
        options.image = 'debug-'+options.image;
    }
    console.log(options);

    return new Promise(function(resolve, reject) {
        var bash = "ssh root@" + host + ' docker run -itd --volumes-from docker-volume-' + options.creator +
          ' -v /var/www/storage/codes/' + options.creator + "/" + options.name +
          ':/root/workspace -v /var/www/storage/codes/' + options.creator + '/.ssh:/root/.ssh' + config + ' -p ' + options.socketPort + ':3000 -p ' + options.appPort  +
          ':'+ options.exposePort +' -p ' + options.sshPort + ':22 ' + port +
          ' -h ' + options.hostName +
          ' -w /root/workspace --name="gospel_project_' + options.name + '" gospel-' +
          options.image + " && echo success";
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err) reject(err);
            resolve("success");
        });
    });
},
shells.gitClone = function(options) {

    var host = options.host || '120.76.235.234';
    console.log(options);
    var bash_clone = "ssh root@" + host + " git clone " + options.gitURL +
        " /var/www/storage/codes/" + options.user + "/" + options.projectname;
    //执行删除命令
    console.log(bash_clone);
    exec(bash_clone, function(err, data) {
        console.log(err);
        console.log(data);
    })
}

shells.nginx = function*(options) {

    var host = options.host || '120.76.235.234';
    exec("ssh root@" + host +
        " service nginx restart && echo 'success'",
        function(err, data) {
            console.log(data);
            console.log(err);
        });

}
shells.delNginxConf = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " rm /etc/nginx/conf.d/" +
            options.projectname +
            ".120.76.235.234.conf",
            function(err, data) {
                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });

    })
}

shells.rmDocker = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            " docker rm -f  gospel_project_" +
            options.docker,
            function(err, data) {
                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.stopDocker = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            " docker stop  gospel_project_" +
            options.docker,
            function(err, data) {
                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.rmFile = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " rm -rf " + options.fileName,
            function(err,
                data) {

                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.buidDB = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        var bash = '';
        console.log(options);
        if (options.type == 'mysql') {
            bash =
                'docker run -p ' + options.port + ':3306  --name ' +
                options.dbName +
                ' -v /var/www/storage' + options.user +
                '/dbs/mysql:/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD="' +
                options.password + '" -d mariadb';
        }
        if (options.type == 'mongodb') {
            bash =
                'docker run -d -p ' + options.port + ':27017 -p ' +
                options.httpPort +
                ':28017 --name ' + options.dbName +
                ' -e MONGODB_PASS="' +
                options.password +
                '" tutum/mongodb'
        }
        if (options.type == 'postgres') {
            bash = 'docker run -p ' + options.port +
                ':5432 --name ' + options.dbName +
                ' -e POSTGRES_PASSWORD=' + options.password +
                ' -d postgres'
        }
        console.log(bash);
        exec("ssh root@" + host + " " + bash + " && echo success",
            function(err, data) {
                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.exposePort = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec(
            "ssh root@" + host +
            " sh /root/gospely/delploy/shell/docker_expose.sh " +
            options.docker + " add " + options.dockerPort + ":" +
            options.port,
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

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " docker stop " + options.docker +
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

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " docker restart " + options
            .docker +
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

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " docker stop " + options.docker +
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

    var host = options.host || '120.76.235.234';
    yield this.stopDB(options);
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " docker rm -f " + options.docker +
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

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            "  /root/gospely/deploy/extend/extend.js -c " +
            options.docker +
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

        var host = options.host || '120.76.235.234';
        return new Promise(function(resolve, reject) {
            exec("ssh root@" + host +
                " docker run -itd -v /var/www/storage/codes" +
                options.user +
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
shells.sshKey = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            " 'ssh-keygen -t rsa -P '' -f /var/www/storage/codes/" + options.user + "/.ssh/id_rsa'",
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

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " docker exec " + options.docker +
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

    var host = options.host || '120.76.235.234';
    console.log("startTerminal");
    exec("ssh root@" + host + " sh /root/startTerminal.sh " + options.docker,
        function(err, data) {
            console.log(err);
            console.log(data);
        });
}

//解压文件
shells.decomFile = function(options) {

    var host = options.host || '120.76.235.234';
    console.log("=======decomDir=======");
    var baseDir = '/var/www/sotrage/code/';
    var comDir = options.comDir;
    var decomDir = path.join(baseDir, options.username, options.projectName);
    return {
        zip: function() {
            console.log("zip");
            return new Promise(function(resolve, reject) {
                exec('ssh root@" + host  + " unzip ' + comDir +
                    ' ' + decomDir,
                    function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
        tar: function() {
            console.log("tar")
            return new Promise(function(resolve, reject) {
                console.log("promise ,tar");
                exec('ssh root@' + host + ' tar -zxvf ' + comDir +
                    ' ' + decomDir,
                    function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
        gz: function() {
            console.log("gz")
            return new Promise(function(resolve, reject) {
                exec('ssh root@' + host + ' gzip -d ' + comDir +
                    ' ' + decomDir,
                    function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
        rar: function() {
            console.log("rar")
            return new Promise(function(resolve, reject) {
                exec('ssh root@' + host + ' rar x ' + comDir +
                    ' ' + decomDir,
                    function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
    };
}
shells.killPID = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + '  docker exec ' + options.docker +
            ' kill -s 9 ' + options.pid,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
shells.initFrameWork = function() {

    return {
        vuef7: function(){

        },
        yo: function() {

        }
    }
}
shells.getKey = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' cat var/www/storage/codes' + options.user + '.ssh/id_rsa.pub' ,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    } );
}
//提交镜像
shells.commit = function*(options){
    console.log(options);
    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        console.log(host);
        exec('ssh root@' + host + ' docker commit -a "'+ options.user +'@gospely" -m "deploy" ' + options.docker + ' ' + options.name,
            function(err, data) {
                console.log(err);
                console.log(data);
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
//将镜像推动到阿里云仓库
shells.dockerPush = function*(options){

    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' docker login --username=937257166@qq.com registry.cn-hangzhou.aliyuncs.com -paixrslwh1993'+
            ' && docker tag '+ options.imageId + ' registry.cn-hangzhou.aliyuncs.com/gospel/deploy:' + options.name +
            ' &&  docker push registry.cn-hangzhou.aliyuncs.com/gospel/deploy:'+
            ' && docker rm ' + options.imageId +
            ' && echo success',
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
module.exports = shells;
