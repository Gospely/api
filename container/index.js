var models = require('../models');
var containers = {};

containers.filter = function*(next){

    var split = this.url.split("/");
    var id = split[split.length-1]

    var operate = split[split.length-2];
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
    this.containerName = application.docker;
    this.remoteIp = application.host;
    this.image = application.images;
    yield next;

}
module.exports = containers;
