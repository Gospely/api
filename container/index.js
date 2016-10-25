var models = require('../models');
var containers = {};

containers.filter = function*(next){

    var split = this.url.split("/");
    var id = split[split.length-1]

    var application = yield models.gospel_applications.findById(id);
    console.log(application.docker);
    this.containerName = application.docker;
    yield next;

}
console.log(containers);
module.exports = containers;
