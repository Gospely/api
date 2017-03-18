var util = require('../utils.js');
var models = require('../models');
var shell = require('../shell');

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
schedules.list = function*(){

    var token = this.query.token;
    if(token == '123456'){
        yield schedules.deleteDocker();
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
