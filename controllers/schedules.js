var util = require('../utils.js');
var models = require('../models');
var shell = require('../shell');

var schedules = {};

schedules.list = function*(){

    var token = this.query.token;
    //校验token
    if(true){
        var result = yield shell.dockerList({
            //host: '192.168.0.1'
            host: 'gospely.com'
        });
        var dockers = result.split('\n');
        console.log(dockers);
        for (var i = 0; i < dockers.length; i++) {

            try {
                if(dockers[i] != ''){
                    var application = yield models.gospel_applications.findAll({
                        where: {
                            docker: dockers[i],
                            isDeleted: 1
                        }
                    });
                    var fileName = application[0].dataValues.docker.replace('gospel_project_','');
                    console.log(application);
                    if(application.length < 1){
                    }else {
                        if(application[0].dataValues != null && application[0].dataValues != undefined){
                            //清理docker
                            console.log(dockers[i]);
                            yield shell.stopDocker({
                                host: application[0].dataValues.host,
                                name: dockers[i],
                            });
                            setTimeout(function(){
                                shell.clearApp({
                                    host: application[0].dataValues.host,
                                    user: application[0].dataValues.creator,
                                    fileName: fileName,
                                    docker: dockers[i],
                                    nginx: false
                                });
                            }, 200)

                        }
                    }
                }
            } catch (e) {
                //写入日志
            } finally {

            }

        }

    }

}
module.exports = schedules;
