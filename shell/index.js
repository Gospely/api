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
    var name = options.domain.replace(new RegExp('-', 'gm'), '_');
    cmd = cmd.replace(new RegExp('projectname', 'gm'), name);
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
    return new Promise(function(resolve, reject) {
        var bash = "ssh root@" + host + ' docker run -itd --volumes-from docker-volume-' + options.creator +
        ' -p ' + config + options.socketPort + ':3000 -p ' + options.appPort +
        ':'+ options.exposePort +' -p ' + options.sshPort + ':22 ' + port +
        ' -h ' + options.hostName +
        ' -w /root/workspace --name="gospel_deploy_' + options.name + '"  gospel-' +
        options.image + " && echo success";
        exec(bash, function(err, data) {
            if (err) reject(err);
            resolve("success");
        });
    });
},
shells.fast_deploy = function*(options) {
    var host = options.host || '120.76.235.234';
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
    console.log(options);
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
shells.changePWD = function*(options){
    console.log(options);
    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' sh /root/gospely/deploy/shell/changePWD.sh gospel_project_' + options.name + " " + options.password,
            function(err, data) {
                console.log(err);
                console.log(data);
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
shells.initDebug = function*(options){

    console.log(options);
    var host = options.host || '120.76.235.234';
    var port = '',
        config = '';
    if(options.parent == 'nodejs:latest'){
         options.version = 'latest';
    }
    if(options.db != null && options.db != undefined && options.db != '') {
        config = ' -e "DBUSER=' + options.dbUser + '" -e "DBPASS=' + options.password + '" -e "USERID=' + options.creator  + '" -e "NGPORT=' + options.appPort + '" ';
        port =  ' -p ' + options.dbPort + ':3306';
        var splits = options.image.split(":");
        if(options.framework != null && options.framework != ''){
            splits = options.framework.split(":");
            options.version = splits[1];
        }
        if(options.db == 'mysql') {
            options.image =  splits[0] + "-mariadb";
        }else{
            options.image = splits[0] + "-" + options.db;
        }
        options.image = options.image + ":" + options.version;
    }
    if(options.framework ==null || options.framework == undefined || options.framework == ''){
        options.image = 'debug-'+options.image;
        if(options.parent == 'html:latest' || options.parent == 'nodejs:latest'){
             options.exposePort = 80;
        }
        if(options.parent == 'php:latest'){
            options.image = options.image.split(":")[0] + ":" + options.version;
        }
    }else {
        if(options.parent == 'html:latest' || options.parent == 'nodejs:latest'){
             options.exposePort = 80;
        }
    }

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
            if (err) reject(err);
            resolve("success");
        });
    });
},
shells.gitClone = function(options) {

    var host = options.host || '120.76.235.234';
    var bash_clone = "ssh root@" + host + " git clone " + options.gitURL +
        " --depth=1 /var/www/storage/codes/" + options.user + "/" + options.projectname;
    //执行删除命令
    exec(bash_clone, function(err, data) {

    })
}

shells.nginx = function*(options) {

    new Promise(function(resolve, reject){
        var host = options.host || '120.76.235.234';
        exec("ssh root@" + host +
            " lsof -i:80 | grep 'nginx' | head -1 | awk '{print $2}'",
            function(err, data) {
                console.log(console.err);
                console.log(data);
                console.log('==========================getPId===================');
                if(err){
                    reject(err)
                }else {
                    exec("ssh root@" + host +
                        " kill -9 " + data,
                        function(err, data) {
                            console.log(err);
                            console.log(data);
                            console.log('==========================kill===================' + data);
                            if (err) {
                                exec("ssh root@" + host +
                                    " service nginx restart",
                                    function(err, data) {
                                        console.log(err);
                                        console.log(data);
                                        console.log('==========================restart===================' + data);
                                        if (err) reject(err);
                                        resolve(data);
                                    });
                                reject(err);
                            }else{
                                exec("ssh root@" + host +
                                    " service nginx restart",
                                    function(err, data) {
                                        console.log(err);
                                        console.log(data);
                                        console.log('==========================restart===================' + data);
                                        if (err) reject(err);
                                        resolve(data);
                                    });
                            }
                        });
                }
                console.log(data);
            });
    });

}
shells.delNginxConf = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + " rm /etc/nginx/conf.d/" +
            options.name +
            ".gospely.com.conf",
            function(err, data) {
                if (err) reject(err);
                resolve(data);
            });

    })
}

shells.rmDocker = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            " docker rm -f " +
            options.name,
            function(err, data) {
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.stopDocker = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            " docker stop " +
            options.name,
            function(err, data) {
                console.log(err);
                console.log(data);
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
        exec("ssh root@" + host + " " + bash + " && echo success",
            function(err, data) {
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
                " docker run -itd -v /var/www/storage/codes/" +
                options.user +
                " --name=docker-volume-" + options.user +
                " ubuntu /bin/bash && echo success",
                function(err,
                    data) {
                    if (err) reject(err);
                    resolve(data);
                });
        })
    }
shells.sshKey = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +
            ' \'ssh-keygen -t rsa -P "" -f /var/www/storage/codes/' + options.user + '/.ssh/id_rsa\'',
            function(err,
                data) {
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.mkdir = function*(options) {

    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host +  ' mkdir /var/www/storage/codes/' + options.user,
            function(err,
                data) {
                if (err) reject(err);
                exec("ssh root@" + host +  ' mkdir /var/www/storage/codes/' + options.user + '/.ssh ',
                    function(err,
                        data) {
                        if (err) reject(err);
                        resolve(data);
                });
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
    exec("ssh root@" + host + " sh /root/startTerminal.sh " + options.docker,
        function(err, data) {
        });
}

//解压文件
shells.decomFile = function(options) {

    var host = options.host || '120.76.235.234';
    console.log("================"+host+"+++++++++++++++++");
    var baseDir = '/var/www/storage/codes/';
    var comDir = baseDir + 'temp/' + options.comDir;
    console.log(comDir);
    var decomDir = path.join(baseDir, options.folder);
    console.log(decomDir);
    return {
        zip: function() {

            var bash = 'ssh root@' + host  + ' unzip -n ' + comDir +
                ' -d ' + decomDir + ' && rm -rf ' + comDir;
            if(options.isOver == 'true'){
                bash = 'ssh root@' + host  + ' unzip -o ' + comDir +
                    ' -d ' + decomDir + ' && rm -rf ' + comDir;
            }
            return new Promise(function(resolve, reject) {
                exec(bash, function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
        tar: function() {
            return new Promise(function(resolve, reject) {
                exec('ssh root@' + host + ' tar -zxvf ' + comDir +
                    ' ' + decomDir + ' && rm -rf ' + comDir,
                    function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
        gz: function() {
            return new Promise(function(resolve, reject) {
                exec('ssh root@' + host + ' gzip -d ' + comDir +
                    ' ' + decomDir + ' && rm -rf ' + comDir,
                    function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    });
            });
        },
        rar: function() {
            return new Promise(function(resolve, reject) {
                exec('ssh root@' + host + ' rar x ' + comDir +
                    ' ' + decomDir + ' && rm -rf ' + comDir,
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
        exec('ssh root@' + host + ' cat /var/www/storage/codes/' + options.user + '/.ssh/id_rsa.pub' ,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    } );
}
//提交镜像
shells.commit = function*(options){
    var host = options.host || '120.76.235.234';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' docker commit -a "'+ options.user +'@gospely" -m "deploy" ' + options.docker + ' ' + options.name,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
//将镜像推动到阿里云仓库
shells.dockerPush = function*(options){

    return new Promise(function(resolve, reject) {
        exec('ssh root@' + options.host + ' docker login --username=937257166@qq.com registry.cn-hangzhou.aliyuncs.com -paixrslwh1993'+
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
shells.moveFile = function*(options){

    return new Promise(function(resolve, reject) {
        var bash = 'ssh root@' + options.host + ' mv ' + options.file  + ' ' + options.distFold;
        console.log(bash);
        exec(bash, function(err,data){
            console.log(err);
            console.log(data);
            if (err)
                reject(err);
            resolve(data);
        })
    });
}
shells.changePort = function*(options){

    return new Promise(function(resolve, reject) {
        var bash = 'ssh root@' + options.host + ' docker exec  ' + options.docker  + ' sed -i -e "s/127.0.0.1:' + options.oldPort +
        '/127.0.0.1:' + options.port + '/" /etc/nginx/host.d/default.conf && echo success' ;
        console.log(bash);
        exec(bash, function(err,data){
            console.log(err);
            console.log(data);
            if (err)
                reject(err);
            exec('ssh root@' + options.host + ' docker stop ' + options.docker + ' && echo success', function(err,data){
                console.log(err);
                console.log(data);
                resolve(data);
            })
        })
    });
}
shells.dockerList = function*(options){
    return new Promise(function(resolve, reject) {
        var bash = 'ssh root@' + options.host + " docker ps -a | awk '$16 ~ /gospel_project/ {print $16}'";
        console.log(bash);
        exec(bash, function(err,data){
            if (err)
                reject(err);
            resolve(data);
        })
    });
}
shells.clearApp = function(options){

    console.log(options);
    var bash = 'ssh root@' + options.host + ' sh /root/gospely/deploy/shell/clear.sh ' + options.user + ' ' + options.fileName + ' ' + options.docker;
    console.log(bash);
    exec(bash, function(err,data){

        console.log(err);
        console.log(data);
        if(!err){
            if(options.nginx){
                exec('ssh root@' + options.host + ' service nginx restart', function(err,data){
                    console.log(err);
                    console.log(data);
                })
            }
        }
    })

}

shells.packApp = function(options) {
    return new Promise(function(resolve, reject) {
        console.log(options);
        var bash = 'cd /var/www/storage/codes/' + options.user + "/" + options.projectFolder +' && zip -x "node_modules*" -r /var/www/storage/codes/temp/' + options.appName + '.zip ' + '.';
        console.log(bash);
        exec(bash, {
            maxBuffer:  1024 * 1024
        },function(err, data) {
            if (err)
                reject(err);
            resolve(data);
        });
    });

}
shells.gitChange = function*(){

    return new Promise(function(resolve, reject) {
        console.log(options);
        var bash = 'ssh root@' + options.host + " sh /root/gospely/deploy/shell/docker_bash.sh " + options.docker + " git status | tail -n +6 | head -n -2 | awk '{print $2}'";
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitChange = function*(options){

    return new Promise(function(resolve, reject) {
        console.log(options);
        var bash = 'ssh root@' + options.host + " sh /root/gospely/deploy/shell/status.sh " + options.docker;
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitCommit = function*(options){

    return new Promise(function(resolve, reject) {
        console.log(options);
        var bash = 'ssh root@' + options.host + " sh /root/gospely/deploy/shell/status.sh " + options.docker;
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitOrigin = function*(options){

    return new Promise(function(resolve, reject) {
        console.log(options);
        var bash = 'ssh root@' + options.host + " sh /root/gospely/deploy/shell/origin.sh " + options.docker;
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
//shells.isGit = function()
module.exports = shells;
