var fs = require('fs');
var uuid = require('node-uuid');
var exec = require('child_process').exec;
var path = require('path');
var shells = {};
var scriptDir = '/root/gospely/deploy/shell/';
var dockerBase = '/var/www/storage/codes/'
var hostBase =  '/mnt/var/www/storage/codes/';
var hostSource = '/mnt/gospely/';
var config = require('../configs')

shells.domain = function*(options) {

    var host = options.host || '120.79.150.56';
    var file = __dirname + "/domain.txt";
    var cmd = fs.readFileSync(file, "utf8");
    cmd = cmd.replace('user', options.user).replace('port', options.port);
    var name = options.domain.replace(new RegExp('-', 'gm'), '_');
    if(options.operate){
        cmd = cmd.replace(new RegExp('domain.gospely.com', 'gm'), options.domain);
        cmd = cmd.replace(new RegExp('projectname.gospely.com', 'gm'), name);
        cmd = cmd.replace(new RegExp('projectname', 'gm'), options.domain + uuid.v4());
    }else {
        cmd = cmd.replace(new RegExp('gospely.com', 'gm'), config.dnspod.baseDomain);
        cmd = cmd.replace(new RegExp('domain', 'gm'), options.domain);
        cmd = cmd.replace(new RegExp('projectname', 'gm'), name);
    }
    cmd = cmd.replace(new RegExp('upstreamname', 'gm'), uuid.v4());
    ;
    return new Promise(function(resolve, reject) {
        options.user = '';
        cmd = cmd.trim();
        exec("ssh root@" + host + ' -p 22' + " " + cmd, function(err, data) {
            if (err) reject(err);
            resolve("success");
        });
    });
}
shells.docker = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        var bash = "ssh root@" + host + ' -p 22' + ' docker run -itd ' +
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
    var host = options.host || '120.79.150.56';
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
    ;
  return new Promise(function(resolve, reject) {
      var bash = "ssh root@" + host + ' -p 22' + ' docker run -itd ' + ' -m ' + options.memory +
        ' -v ' + hostBase + options.creator + "/" + options.name +
        ':/root/workspace -v ' + hostBase  + options.creator + '/.ssh:/root/.ssh'  + config + ' -p ' + options.socketPort + ':3000 -p ' + options.appPort  +
        ':80 -p ' + options.sshPort + ':22 ' + port +
        ' -h ' + options.hostName +
        ' -w /root/workspace --name="gospel_project_' + options.name + '"  gospel-' +
        options.image + " && echo success";
        ;
      exec(bash, function(err, data) {
          if (err) reject(err);
          resolve("success");
      });
  });
}

shells.mvFiles = function*(options){
    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {

        try {
            exec('ssh root@' + host + ' -p 22' + ' sh '+ scriptDir + 'mv.sh gospel_project_' + options.name,
                function(err, data) {
                    resolve(data);
                });
        } catch (e) {
            resolve(e);
        }
    });
}
shells.changePWD = function*(options){
    ;
    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {

        exec('ssh root@' + host + ' -p 22' + ' sh '+ scriptDir + 'changePWD.sh gospel_project_' + options.name + " " + options.password,
            function(err, data) {
                ;
                ;
                if (err)
                    reject(err);
                resolve(data);
            });

    });
}
shells.changePWD2 = function*(options){
    ;
    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {

        exec("ssh root@" + host + ' -p 22' + " docker start " + options.name +
            " && echo success",
            function(err,
                data) {
                ;
                ;
                if (err) reject(err);
                exec('ssh root@' + host + ' -p 22' + ' sh '+ scriptDir + 'changePWD.sh ' + options.name + " " + options.password,
                    function(err, data) {
                        ;
                        ;
                        if (err)
                            reject(err);
                        if(options.status != 1) {
                            console.log('stop');
                            exec("ssh root@" + host + ' -p 22' + " docker stop " + options.name +
                                " && echo success",
                                function(err, data) {
                                    ;
                                    ;
                                    if (err)
                                        reject(err);
                                    resolve(data);
                                });
                        }else {
                            resolve(data);
                        }

                    });
            });
    });
}
shells.initDebug = function*(options){

    ;
    var host = options.host || '120.79.150.56';
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
    if(options.parent == 'python:latest') {
        options.image = 'debug-' + options.parent.split(":")[0] + ':' + options.version;
    }

    return new Promise(function(resolve, reject) {

        var bash = "ssh root@" + host + ' -p 22' + ' docker run -itd ' +
          ' -v ' + hostBase  + options.creator + "/" + options.name + ':/root/workspace -v '
          + hostBase + options.creator + '/.ssh:/root/.ssh' + config + ' -p ' + options.socketPort + ':3000 -p ' + options.appPort  +
          ':'+ options.exposePort +' -p ' + options.sshPort + ':22 ' + port +
          ' -h ' + options.hostName +
          ' -w /root/workspace --name="gospel_project_' + options.name + '" gospel-' +
          options.image + " && echo success";
          ;
        exec(bash, function(err, data) {
            if (err) reject(err);
            resolve("success");
        });
    });
},

shells.recover = function*(options){

    var host = options.host || '120.79.150.56';
    ;
    var port = '';
    if(options.dbPort){
        port = ' -p ' + options.dbPort + ':3306';
    }
    return new Promise(function(resolve, reject) {

        var bash = "ssh root@" + host + ' -p 22' + ' docker run -itd ' +
          ' -v ' + hostBase  + options.creator + "/" + options.name + ':/root/workspace -v '
          + hostBase + options.creator + '/.ssh:/root/.ssh' + ' -p ' + options.socketPort + ':3000 -p ' + options.appPort  +
          ':'+ options.exposePort +' -p ' + options.sshPort + ':22 ' + port +
          ' -h ' + options.hostName +
          ' -w /root/workspace --name="gospel_project_' + options.name + '" gospel-' +
          options.image + " && echo success";
          ;
        exec(bash, function(err, data) {
            if (err) reject(err);
            resolve("success");
        });
    });
},
shells.gitClone = function(options) {

    var host = options.host || '120.79.150.56';
    var bash_clone = "ssh root@" + host + ' -p 22' + " git clone " + options.gitURL +
        " --depth=1 /" + hostBase + options.user + "/" + options.projectname;
    //执行删除命令
    exec(bash_clone, function(err, data) {

    })
}

shells.nginx = function*(options) {

    new Promise(function(resolve, reject){
        var host = options.host || '120.79.150.56';
        return new Promise(function(resolve, reject) {
            exec("ssh root@" + host + ' -p 22' + " nginx -s reload",
                function(err, data) {
                    if (err) reject(err);
                    resolve(data);
                });

        })
        // exec("ssh root@" + host + ' -p 22' +
        //     " lsof -i:80 | grep 'nginx' | head -1 | awk '{print $2}'",
        //     function(err, data) {
        //         console.log(console.err);
        //         ;
        //         console.log('==========================getPId===================');
        //         if(err){
        //             reject(err)
        //         }else {
        //             exec("ssh root@" + host + ' -p 22' +
        //                 " kill -9 " + data,
        //                 function(err, data) {
        //                     ;
        //                     ;
        //                     console.log('==========================kill===================' + data);
        //                     if (err) {
        //                         exec("ssh root@" + host + ' -p 22' +
        //                             " service nginx restart",
        //                             function(err, data) {
        //                                 ;
        //                                 ;
        //                                 console.log('==========================restart===================' + data);
        //                                 if (err) reject(err);
        //                                 resolve(data);
        //                             });
        //                         reject(err);
        //                     }else{
        //                         exec("ssh root@" + host + ' -p 22' +
        //                             " service nginx restart",
        //                             function(err, data) {
        //                                 ;
        //                                 ;
        //                                 console.log('==========================restart===================' + data);
        //                                 if (err) reject(err);
        //                                 resolve(data);
        //                             });
        //                     }
        //                 });
        //         }
        //         ;
        //     });
    });

}
shells.delNginxConf = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " rm /mnt/etc/nginx/conf.d/" + options.name,
            function(err, data) {
                if (err) reject(err);
                resolve(data);
            });

    })
}

shells.rmDocker = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +
            " docker rm -f " +
            options.name,
            function(err, data) {
                if (err) resolve(err);
                resolve(data);
            });
    })
}
shells.stopDocker = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +
            " docker stop " +
            options.name,
            function(err, data) {
                ;
                ;
                if (err) reject(err);
                    resolve(data);
            });
    })
}
shells.rmFile = function*(options) {

    var host = options.host || '120.79.150.56';
    console.log(options.fileName);
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " rm -f " + options.fileName,
            function(err,
                data) {
                ;
                ;
                if (err) reject(err);
                resolve(data);
            });
    })
}

shells.ls = function*(options) {

    var host = options.host || '120.79.150.56';
    console.log(options.fileName);
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " ls -l /etc/nginx/conf.d | awk '{print $9}'",
            function(err,
                data) {
                ;
                ;
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.buidDB = function*(options) {

    ;
    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        var bash = '';
        if (options.type == 'mysql') {
            bash =
                'docker run -p ' + options.port + ':3306  --name '+
                options.dbName +
                ' -v /mnt/var/www/storage' + options.user +
                '/dbs/mysql/' + options.dbName + ':/etc/mysql/conf.d -e MYSQL_ROOT_PASSWORD="' +
                options.password + '" -d mariadb';
        }
        if (options.type == 'mongodb') {
            bash =
                'docker run -d -p ' + options.port + ':27017 -p ' + ' -m 256m --memory-swap=256m' +
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
        exec("ssh root@" + host + ' -p 22' + " " + bash + " && echo success",
            function(err, data) {
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.exposePort = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec(
            "ssh root@" + host + ' -p 22' +
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

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " docker stop " + options.docker +
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

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " docker restart " + options
            .docker +
            " && echo success",
            function(err,
                data) {
                ;
                ;
                if (err) reject(err);
                resolve(data);
            });
    })
}

//start
shells.startDB = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " docker start " + options.docker +
            " && echo success",
            function(err,
                data) {
                ;
                ;
                if (err) reject(err);
                resolve(data);
            });
    })
}

//unstall db
shells.rmDB = function*(options) {

    var host = options.host || '120.79.150.56';
    yield this.stopDB(options);
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " docker rm -f " + options.docker +
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

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +
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

        var host = options.host || '120.79.150.56';
        return new Promise(function(resolve, reject) {
            exec("ssh root@" + host + ' -p 22' +
                " docker run -itd -v " + hostBase +
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

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +
            ' \'ssh-keygen -t rsa -P "" -f ' + hostBase + options.user + '/.ssh/id_rsa\'',
            function(err,
                data) {
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.mkdir = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +  ' mkdir ' + hostBase + options.user,
            function(err,
                data) {
                if (err) reject(err);
                exec("ssh root@" + host + ' -p 22' +  ' mkdir ' + hostBase + options.user + '/.ssh ',
                    function(err,
                        data) {
                        if (err) reject(err);
                        resolve(data);
                });
        });
    })
}
shells.mkFolder = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +  ' mkdir ' + options.fileName,
            function(err,
                data) {
                    if(err)
                        reject(err)
                    resolve(data);
        });
    })
}
shells.cp = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +  ' cp -rf ' + options.target + " " + options.dist,
            function(err,
                data) {
                    if(err)
                        reject(err)
                    resolve(data);
        });
    })
}
shells.mkdirNginx = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' +  ' mkdir /mnt/etc/nginx/conf.d/' + options.user,
            function(err, data) {
                if(err)
                    reject(err)
                resolve(data);
        });
    })
}
//创建用户分区
shells.createStorage = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " sh /root/gospely/deploy/shell/volume/createVolume.sh " + options.user,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}

    //读取数据卷大小
shells.volumeInfo = function*(options) {

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec("ssh root@" + host + ' -p 22' + " docker exec " + options.docker +
            " df -H",
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            })
    });
}
shells.initUser = function*(options) {
    var host = options.host || '120.79.150.56';
    var bash = "ssh root@" + host + ' -p 22' + " sh /root/gospely/deploy/shell/initUser.sh " + options.user;
    ;
    return new Promise(function(resolve, reject) {
        exec(bash, function(err, data) {
                if (err)
                    reject(err);
                    exec('ssh root@' + options.host + ' cat ' + hostBase + options.user + '/.ssh/id_rsa.pub' , function(err, data) {
                        if (err)
                            reject(err);
                        resolve(data);
                    })
            })
    });
}

//启动terminal
shells.startTerminal = function(options) {

    var host = options.host || '120.79.150.56';
    exec("ssh root@" + host + ' -p 22' + " sh /root/gospely/deploy/shell/startTerminal.sh " + options.docker,
        function(err, data) {
        });
}

//解压文件
shells.decomFile = function(options) {

    var host = options.host || '120.79.150.56';
    console.log("================"+host+"+++++++++++++++++");
    var baseDir = '/mnt/var/www/storage/codes/';
    var comDir = baseDir + 'temp/' + options.comDir;
    ;
    var decomDir = path.join(baseDir, options.folder);
    ;
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
                exec('ssh root@' + host + ' -p 22' + ' tar -zxvf ' + comDir +
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
                exec('ssh root@' + host + ' -p 22' + ' gzip -d ' + comDir +
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
                exec('ssh root@' + host + ' -p 22' + ' rar x ' + comDir +
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

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' -p 22' + '  docker exec ' + options.docker +
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
    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec('ssh root@'+ host + ' -p 22' +' cat ' + hostBase + options.user + '/.ssh/id_rsa.pub' ,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    } );
}
//提交镜像
shells.commit = function*(options){
    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        exec('ssh root@' + host + ' -p 22' + ' docker commit -a "'+ options.user +'@gospely" -m "deploy" ' + options.docker + ' ' + options.name,
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
        var bash = 'mv ' + options.file  + ' ' + options.distFold;
        ;
        exec(bash, function(err,data){

            bash = 'rm -rf ' + options.file;
            exec(bash, function(err,data){
                ;
                ;
            })
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
        ;
        exec(bash, function(err,data){
            ;
            ;
            if (err)
                reject(err);
            exec('ssh root@' + options.host + ' docker stop ' + options.docker + ' && echo success', function(err,data){
                ;
                ;
                resolve(data);
            })
        })
    });
}
shells.dockerList = function*(options){
    return new Promise(function(resolve, reject) {
        var bash = 'ssh root@' + options.host + " docker ps -a | awk '$18 ~ /gospel_project/ {print $18}'";
        ;
        exec(bash, function(err,data){
            if (err)
                reject(err);
            resolve(data);
        })
    });
}
shells.clearApp = function(options){

    options.fileName.replace('-', '_');
    ;
    var bash = 'ssh root@' + options.host + ' sh '+ scriptDir + 'clear.sh ' + options.user + ' ' + options.fileName +'.' + config.dnspod.baseDomain + '.conf' + ' ' + options.docker;
    ;
    exec(bash, function(err,data){

        ;
        ;
    })

}

shells.packApp = function(options) {
    return new Promise(function(resolve, reject) {
        ;
        var bash = 'cd ' + dockerBase + options.user + "/" + options.projectFolder +' && zip -x "node_modules*" -r ' + dockerBase + 'temp/' + options.appName + '.zip ' + '.';
        ;
        exec(bash, {
            maxBuffer:  1024 * 1024
        },function(err, data) {
            if (err)
                reject(err);
            resolve(data);
        });
    });

}
shells.gitChange = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh "+ scriptDir + "git/status.sh " + options.docker;
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitCommit = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh " + scriptDir + "git/commit.sh " + options.docker + ' ' + options.message;
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitOrigin = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh " + scriptDir + "git/addOrigin.sh " + options.docker + " " + options.git + ' ' + options.user + ' ' + options.email;
        if(!options.addOrigin){
             bash = 'ssh root@' + options.host + " sh " + scriptDir + "git/resetOrigin.sh " + options.docker + " " + options.git + ' ' + options.user + ' ' + options.email;
        }
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitRemeberPwd = function*(options) {

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh " + scriptDir + "git/rememberPwd.sh " + options.docker + ' ' + options.user + ' ' + options.password;
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitPush = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh " + scriptDir + "git/push.sh " + options.docker + ' ' + options.branch;
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.gitPull = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh "+ scriptDir + "git/pull.sh " + options.docker + ' ' + options.branch;
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.defaultVersion = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh /root/gospely/deploy/shell/boot/start.sh " + options.docker + " 'nvm alias default v" + options.version + "'";
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.startApp = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " sh /root/gospely/deploy/shell/boot/start.sh " + options.docker + " '"+ options.cmd + "'";
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.stopApp = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " docker exec -it " + options.docker + " netstat -anp | grep " + options.port + " | awk '{printf $7}'|cut -d/ -f1";
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err){
                reject(err)
            }else{
                if(data != ''){
                    bash = 'ssh root@' + options.host + " docker exec " + options.docker + "kill -9"  + data;
                    ;
                    exec(bash, function(err, data) {
                        if (err)
                            reject(err);
                        resolve('success');
                    });
                }else{
                    resolve('success');
                }
            }
        });
    });
}

//获取用文件系统的使用百分比
shells.percent = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = 'ssh root@' + options.host + " df -h | awk '$6 ~ /var\/www\/storage\/codes\/" + options.user + "/ {print $5}'";
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.getLogs = function*(options){

    return new Promise(function(resolve, reject) {
        ;
        var bash = "cat /var/www/api/logs/product*.log | grep '" + options.key + "' |" + " grep -v 'getLogs'";
        ;
        exec(bash, function(err, data) {
            ;
            ;
            if (err)
                reject(err);
            resolve(data);
        });
    });
}
shells.checkDocker = function*(options){

    var host = options.host || '120.79.150.56';
    var bash = "ssh root@" + host + ' -p 22' + ' docker info';
    ;
    exec(bash, function(err, data) {

        console.log('');
        ;
        ;
    });
}

shells.getCode = function*(options){

    var host = options.host || '120.79.150.56';
    return new Promise(function(resolve, reject) {
        ;
        var bash = "ssh root@" + host + ' -p 22' + ' echo $? ';
        ;
        setTimeout(function(){
            exec(bash, function(err, data) {
                ;
                ;
                if (err)
                    reject(err);
                resolve(data);
            });
        }, 4000)
    });
}
//shells.isGit = function()
module.exports = shells;
