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
            if(dockers[i] != ''){
                var application = yield models.gospel_applications.findAll({
                    where: {
                        docker: dockers[i],
                        isDeleted: 1
                    }
                });
                console.log(application);
                if(application.length < 1){
                }else {
                    //清理docker
                    console.log(dockers[i]);
                    shell.clearApp({
                        host: application[0].dataValues.host,
                        docker: dockers[i],
                        creator: application[0].dataValues.creator,
                        domain: application[0].dataValues.domain,
                    });
                }
            }
        }

    }

}
module.exports = schedules;
