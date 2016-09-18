var Sequelize = require('sequelize');
var path = require('path');
var config = require('../configs.js');
var reader = require('../utils/reader');

var db = {};

var sequelize = new Sequelize('gospel', 'gospel', 'gospel', {
  host: '119.29.243.71',
  dialect: 'postgresql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  define: {
    classMethods: {
      getAll: function*(){
          console.log(1)
          return yield this.findAll();
      },
      findById: function*(id) {
          console.log(id);
          return yield this.find({where:{id:id}});
      },
      delete: function*(id){
          console.log(1)
          return yield this.update({isDeletted: 1},{where: {id: id}});
      },
    },
    instanceMethods: {

    }
  }
});
/**
 * Takes a read file and passes it to sequelize import
 * Puts all references inside a DB object for easy getting
 *
 * @param  {String} file read model file definition
 * @return {array}      returns array of models
 */
function loadModel(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;

    return model;
}

// read all the models inside the models/ directory and load them
reader.readDir(__dirname).map(loadModel);

/**
 * Make an association to the DB object,
 * not really sure what's this for
 *
 * @param  {string} modelName Name of the model
 */
function makeAssociation(modelName) {
    if (typeof db[modelName].associate === 'function') {
        db[modelName].associate(db);
    }
}

Object.keys(db).map(makeAssociation);

// export references to sequelize

db.Sequelize = Sequelize;
db.sequelize = sequelize;
module.exports = db;
