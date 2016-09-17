var path = require('path');
var sequelize = require('../db.js');

function load(name) {
  return sequelize.import(path.join(__dirname, name));
}
var User = load('UsersModel');


module.exports = {
  sequelize: sequelize,
  User: User
};
