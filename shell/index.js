var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var shells = {};

shells.domain = function*(options) {

    var host = options.host || 'root@gospely.com';
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
        exec("ssh " + host + " " + cmd, function(err, data) {
            if (err) reject(err);
            resolve("success");
        });
    });
}
shells.docker = function*(options) {

    var host = options.host || 'root@gospely.com';
    console.log(options);
    return new Promise(function(resolve, reject) {
        var bash = "ssh " + host +
            " /root/gospely/allocate/start.js -n " + options.name +
            " -m " +
            options.memory + " -c " + options.creator + " -f " +
            options.file +
            " -p " + options.socketPort +
            " -s " + options.sshPort + " -a " + options.appPort +
            " -w " +
            options.password + " -o " + options.hostName +
            " && echo 'sucess'";
        console.log(bash);
        exec(bash, function(err, data) {
            console.log(err);
            console.log(data);
            if (err) reject(err);
            resolve("success");
        });
    });
}

shells.gitClone = function(options) {

    var host = options.host || 'root@gospely.com';
    console.log(options);
    var bash_clone = "ssh " + host + " git clone " + options.gitURL +
        " /var/www/storage/codes/" + options.user + "/" + options.projectname;
    //执行删除命令
    console.log(bash_clone);
    exec(bash_clone, function(err, data) {
        console.log(err);
        console.log(data);
    })
}

shells.nginx = function*() {

    var host = options.host || 'root@gospely.com';
    exec("ssh " + host +
        " service nginx restart && echo 'success'",
        function(err, data) {
            console.log(data);
            console.log(err);
        });

}
shells.delNginxConf = function*(options) {

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " rm /etc/nginx/conf.d/" +
            options.projectname +
            ".gospely.com.conf",
            function(err, data) {
                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });

    })
}

shells.rmDocker = function*(options) {

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host +
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host +
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " rm -rf " + options.fileName,
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

    var host = options.host || 'root@gospely.com';
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
        exec("ssh " + host + " " + bash + " && echo success",
            function(err, data) {
                console.log(data);
                console.log(err);
                if (err) reject(err);
                resolve(data);
            });
    })
}
shells.exposePort = function*(options) {

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec(
            "ssh " + host +
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " docker stop " + options.docker +
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " docker restart " + options
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " docker stop " + options.docker +
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

    var host = options.host || 'root@gospely.com';
    yield this.stopDB(options);
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " docker rm -f " + options.docker +
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host +
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

        var host = options.host || 'root@gospely.com';
        return new Promise(function(resolve, reject) {
            exec("ssh " + host +
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
    //读取数据卷大小
shells.volumeInfo = function*(options) {

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec("ssh " + host + " docker exec " + options.docker +
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

    var host = options.host || 'root@gospely.com';
    console.log("startTerminal");
    exec("ssh " + host + " sh /root/startTerminal.sh " + options.docker,
        function(err, data) {
            console.log(err);
            console.log(data);
        });
}

//解压文件
shells.decomFile = function(options) {

    var host = options.host || 'root@gospely.com';
    console.log("=======decomDir=======");
    var baseDir = '/var/www/sotrage/code/';
    var comDir = options.comDir;
    var decomDir = path.join(baseDir, options.username, options.projectName);
    return {
        zip: function() {
            console.log("zip");
            return new Promise(function(resolve, reject) {
                exec('ssh" + host  + " unzip ' + comDir +
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
                exec('ssh ' + host + ' tar -zxvf ' + comDir +
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
                exec('ssh ' + host + ' gzip -d ' + comDir +
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
                exec('ssh ' + host + ' rar x ' + comDir +
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

    var host = options.host || 'root@gospely.com';
    return new Promise(function(resolve, reject) {
        exec('ssh ' + host + '  docker exec ' + options.docker +
            ' kill -s 9 ' + options.pid,
            function(err, data) {
                if (err)
                    reject(err);
                resolve(data);
            });
    });
}
module.exports = shells;
