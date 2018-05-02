var util = require('../utils.js');
var models = require('../models');
var shell = require('../shell');
var dnspod = require('../server/dnspod');
var processes = require('../process');
var portManager = require('../port');
var uuid = require('node-uuid');



var schedules = {};

schedules.deleteDocker = function*(){

    var applications = yield models.gospel_applications.findAll({
        where: {
            isDeleted: 1
        }
    });

    for (var i = 0; i < applications.length; i++) {

        try {
            console.log(applications[i].docker);
            var result = yield shell.stopDocker({
                host: 'gospely.com',
                name: applications[i].docker,
            });

            ;
            var fileName = applications[i].docker.replace('gospel_project_','');
            function clearApp(){
                if(applications[i].dataValues) {
                    shell.clearApp({
                        host: applications[i].dataValues.host,
                        user: applications[i].creator,
                        fileName: fileName,
                        docker: applications[i].docker,
                        nginx: false
                    });
                }
                // models.gospel_applications.destroy({
                //     where: {
                //         id: applications[i].id,
                //         isDeleted: 1
                //     },
                //     force: false
                // });
            }
            setTimeout(clearApp, 200);
        } catch (e) {
            console.log("exception" + e);
            if(applications[i].docker){
                var fileName = applications[i].docker.replace('gospel_project_','');
                setTimeout(clearApp, 200);
            }
        } finally {
            // models.gospel_applications.destroy({
            //     where: {
            //         id: applications[i].id,
            //         isDeleted: 1
            //     },
            //     force: false
            // });
        }

    }

}
schedules.clearInnersession = function*(){
    var time = new Date().getTime() -1296000000;
    ;
    var result = yield models.gospel_innersessions.destroy({
        where: {
            time: {
                $lte: time
            },
        },
        force: false
    });
    ;
},
schedules.moveData = function*(){

    // var result = yield shell.dockerList({
    //        //host: '192.168.0.1'
    //        host: '119.23.9.249'
    //    });
    // ;
    // var dockers = result.split('\n');
    // ;
    // var applications = yield models.gospel_applications.getAll({
    //     host: '119.23.9.249'
    // })
    //
    // for (var i = 0; i < dockers.length; i++) {
    //
    //     for (var j = 0; j < applications.length; j++) {
    //         if(applications[j].docker == docker[i]){
    //
    //         }else {
    //             // models.gospel_applications.delete(applications[j].dataValues.id);
    //         }
    //     }
    //     dockers[i]
    // }
    var users = yield models.gospel_users.getAll({
        host: '119.23.9.249'
    });
    console.log(users.length);
    for (var i = 0; i < users.length; i++) {

        //创建文件夹
        try {
            var sshKey = yield shell.initUser({
                user: users[i].dataValues.id,
                host: '120.79.150.56'
            });
            // yield models.gospel_users.modify({
            //     id: users[i].dataValues.id,
            //     sshKey: sshKey
            // });
            yield models.gospel_users.modify({
                id: users[i].dataValues.id,
                sshKey: sshKey,
                host: '120.79.150.56'
            });
        } catch (e) {

        } finally {

        }

        // //获取该用户创建的应用
        //
        // var applications =  yield models.gospel_applications.findAll({
        //     where: {
        //         creator: users[i].dataValues.id,
        //         isDeleted: 0
        //     }
        // })
        // //;
        // for (var i = 0; i < applications.length; i++) {
        //     applications[i]
        //     //在 master 上 创建该应用
        //     //update 该应用的 host
        // }
    }
    //update 该用户的host

}
schedules.changePWD = function*() {

    var applications = yield models.gospel_applications.findAll({
        where:{
            isDeleted: 0,
            sshPassword: '123456'
        }
    }
    )
    ;

    for (var i = 0; i < applications.length; i++) {

        if(applications[i].dataValues.docker){
            try {
                var password = uuid.v4();
                yield shell.changePWD2({
                    password: password,
                    name: applications[i].dataValues.docker,
                    status: applications[i].dataValues.status
                })
                yield models.gospel_applications.modify({
                    id: applications[i].dataValues.id,
                    sshPassword: password
                })
            } catch (e) {
                ;
            } finally {

            }
        }
    }
    console.log('finish');
}
schedules.deleteDomains = function*(){


    // var domains = yield models.gospel_domains.findAll({
    //     where: {
    //         isDeleted: 1
    //     }
    // });
    // ;
    // for (var i = 0; i < domains.length; i++) {
    //     console.log(domains[i].dataValues.record);
    //     var options = {
    //         method: 'recordRemove',
    //         opp: 'recordRemove',
    //         param: {
    //             domain: domains[i].dataValues.domain,
    //             record_id: domains[i].dataValues.record
    //         }
    //     }
    //     //解绑二级域名
    //     yield dnspod.domainOperate(options);
    //     yield shell.rmFile({
    //         fileName: '/mnt/etc/nginx/conf.d/' +  domains[i].dataValues.subDomain.replace('-','_').replace('-','_') + '.' + domains[i].dataValues.domain
    //     })
    //     yield shell.rmFile({
    //         fileName: '/mnt/etc/nginx/conf.d/' + domains[i].dataValues.creator  + '/' +domains[i].dataValues.subDomain.replace('-','_').replace('-','_') + '.' + domains[i].dataValues.domain
    //     })
    //     yield shell.nginx({});
    // }

}
schedules.recover = function*(){
    var applications = yield models.gospel_applications.findAll({
        where: {
            isDeleted: 0
        }
    });

    for (var i = 0; i < applications.length; i++) {
        yield processes.recoverBuild(applications[i].dataValues);
    }
}
schedules.clearDomains = function*(){

    var data = yield dnspod.domainOperate({
        method: 'recordList',
        opp: 'recordList',
        param: {
            domain: 'gospely.com'
        }
    })
    ;


    var domains = yield models.gospel_domains.findAll({
        where: {
            isDeleted: 0
        }
    });

    for (var i = 0; i < data.records.length; i++) {
        var deleteable = true;
        for (var j = 0; j < domains.length; j++) {

            if(data.records[i].name == 'api' || data.records[i].name == 'www'|| data.records[i].name == '@'|| data.records[i].name == 'dash' || data.records[i].name == 'ide'|| data.records[i].name == domains[j].dataValues.subDomain){
                deleteable = false;
                break;
            }
        }
        if(deleteable){
            var options = {
                    method: 'recordRemove',
                    opp: 'recordRemove',
                    param: {
                        domain: 'gospely.com',
                        record_id: data.records[i].id
                    }
                }
                //解绑二级域名
                yield dnspod.domainOperate(options);
                yield shell.rmFile({
                    fileName: '/mnt/etc/nginx/conf.d/' +   data.records[i].name.replace('-','_').replace('-','_') + '.gospely.com'
                })
                // yield shell.rmFile({
                //     fileName: '/mnt/etc/nginx/conf.d/' + domains[i].dataValues.creator  + '/' +domains[i].dataValues.subDomain.replace('-','_').replace('-','_') + '.' + domains[i].dataValues.domain
                // })
        }
        console.log(deleteable, data.records[i].name);
    }
}
schedules.removeConfig = function*(){

    var data = yield shell.ls({});
    var data = data.split('\n');

    var domains = yield dnspod.domainOperate({
        method: 'recordList',
        opp: 'recordList',
        param: {
            domain: 'gospely.com'
        }
    })
    for (var i = 0; i < data.length; i++) {

        var deleteable = true;
        for (var j = 0; j < domains.records.length; j++) {

            if(data[i].replace('_', '-').replace('_','-') == domains.records[j].name + '.gospely.com.conf' || data[i] == 'gospel.engineer.conf' || data[i] == 'gospely.com.conf' || data[i] == 'gospel.design.conf' || data[i] == 'api.gospey.com.conf' ||  data[i] == 'dash.gospey.com.conf' || data[i] == 'ide.gospey.com.conf') {
                deleteable = false;
                break;
            }
        }
        if(deleteable && data[i] != '' && data[i] != 'f0ec0c00-17d1-4593-9d0e-05a71f6fd431'){

            console.log('/mnt/etc/nginx/conf.d/' + data[i]);
            yield shell.rmFile({
                fileName: '/mnt/etc/nginx/conf.d/' + data[i]
            })
        }
    }
}
schedules.checkDocker = function*(ctx){

    shell.checkDocker({});
    var data = yield shell.getCode({});
    ctx.body = {
        code: -1000,
        message: ''
    }
}
schedules.test= function*(ctx){
    // var ports = yield portManager.generatePorts('119.23.9.249', 4);
    // var data = yield shell.initUser({
    //     host: '120.79.150.56',
    //     user: 'test5'
    // })
    // console.log('test');
    // console.log('sadas' + data);
}
schedules.list = function*(){

    var token = this.query.token;
    console.log(this.query);
    if(token == 'gospelytokenaasss'){
        yield schedules[this.query.operation](this);
    }

    //校验token
    // if(true){
    //     var result = yield shell.dockerList({
    //         //host: '192.168.0.1'
    //         host: 'gospely.com'
    //     });
    //     var dockers = result.split('\n');
    //     ;
    //     for (var i = 0; i < dockers.length; i++) {
    //
    //         try {
    //             if(dockers[i] != '' && dockers[i] != null && dockers[i] != undefined){
    //                 var application = yield models.gospel_applications.findAll({
    //                     where: {
    //                         docker: dockers[i],
    //                         isDeleted: 1
    //                     }
    //                 });
    //                 var fileName = application[0].dataValues.docker.replace('gospel_project_','');
    //                 ;
    //                 if(application.length != 1){
    //                 }else {
    //                     if(application != null && application[0].dataValues != null && application[0].dataValues != undefined){
    //                         //清理docker
    //                         console.log(dockers[i]);
    //                         yield shell.stopDocker({
    //                             host: 'gospely.com',
    //                             name: dockers[i],
    //                         });
    //                         function clearApp(){
    //                             shell.clearApp({
    //                                 host: 'gospely.com',
    //                                 user: application[0].dataValues.creator,
    //                                 fileName: fileName,
    //                                 docker: application[0].dataValues.docker,
    //                                 nginx: false
    //                             });
    //                         }
    //                         setTimeout(clearApp, 200)
    //
    //                     }
    //                 }
    //             }
    //         } catch (e) {
    //             //写入日志
    //         } finally {
    //
    //         }
    //
    //     }
    //
    // }

}
schedules.getLogs = function*(ctx){

    var user = yield models.gospel_users.findById('38b66490-1c2c-40b2-9e5a-86fe093b2ea2');
    console.log(user.host);
    ;
     var result = yield shell.getLogs({
         key: ctx.query.key
     })
     ctx.body= result;
}

module.exports = schedules;
