var util = require('../utils.js');
var shells = require('../shell');
var models = require('../models');

var gits = {};
gits.gitChange = function*() {
    var id = this.params.id;
    var application = yield models.gospel_applications.findById(id);
    yield shells.gitChange({
        
    });
}
gits.gitCommit = function*() {

}
gits.gitPush = function*() {

}
gits.gitPull = function*() {

}


module.exports = gits;
