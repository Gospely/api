var models = require('../models');
var containers = {};

containers.filter = function*(next){

    var split = this.url.split("/");
    var id = split[split.length-1]

    var operate = split[split.length-2];
    console.log(operate);
    switch(operate){
      case 'start':
        yield models.gospel_applications.modify({
          id: id,
          status: 1
        });
        break;
      case 'stop':
      yield models.gospel_applications.modify({
        id: id,
        status: -1
      });
        break;
      case 'restart':
      yield models.gospel_applications.modify({
        id: id,
        status: 1
      });
        break;
      default:
    }
    var application = yield models.gospel_applications.findById(id);
    console.log(application.docker);
    this.containerName = application.docker;
    this.ip = application.host;
    console.log(application.host+"==============================");
    yield next;

}
console.log(containers);
module.exports = containers;
