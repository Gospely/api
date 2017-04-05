var util = require('../utils.js');
var models = require('../models');
var shell = require('../shell');
var dnspod = require('../server/dnspod');


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
            console.log(result);
            var fileName = applications[i].docker.replace('gospel_project_','');
            function clearApp(){
                shell.clearApp({
                    host: 'gospely.com',
                    user: applications[i].creator,
                    fileName: fileName,
                    docker: applications[i].docker,
                    nginx: false
                });
                models.gospel_applications.destroy({
                    where: {
                        id: applications[i].id,
                        isDeleted: 1
                    },
                    force: false
                });
            }
            setTimeout(clearApp, 200);
        } catch (e) {
            console.log("exception" + e);
        } finally {

        }

    }

}
schedules.clearInnersession = function*(){
    var time = new Date().getTime() -1296000000;
    console.log(time);
    var result = yield models.gospel_innersessions.destroy({
        where: {
            time: {
                $lte: time
            },
        },
        force: false
    });
    console.log(result);
},
schedules.deleteDomains = function*(){

    var domains = yield models.gospel_domains.findAll({
        where: {
            isDeleted: 1
        }
    });

    for (var i = 0; i < domains.length; i++) {
        domains[i].daataValues.record;

        var domains = yield models.gospel_domains.getAll({
            subDomain: application.domain,
            sub: true,
        })
        var options = {
            method: 'recordRemove',
            opp: 'recordRemove',
            param: {
                domain: domains[i].dataValues.domain,
                record_id: domains[i].dataValues.record
            }
        }
        //解绑二级域名
        yield dnspod.domainOperate(options);
        yield shells.rmFile({
            fileName: '/etc/nginx/conf.d/' +  domains[i].dataValues.subDomain + '.' + domains[i].dataValues.domain
        })
        yield shells.rmFile({
            fileName: '/etc/nginx/conf.d/' + domains[i].dataValues.creator  + '/' + domains[i].dataValues.subDomain + '.' + domains[i].dataValues.domain 
        })
    }

}
schedules.list = function*(){

    var token = this.query.token;
    console.log(this.query);
    if(token == 'gospelytokenaasss'){
        yield schedules[this.query.operation]();
    }

    //校验token
    // if(true){
    //     var result = yield shell.dockerList({
    //         //host: '192.168.0.1'
    //         host: 'gospely.com'
    //     });
    //     var dockers = result.split('\n');
    //     console.log(dockers);
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
    //                 console.log(application);
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


module.exports = schedules;
