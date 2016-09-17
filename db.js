var Sequelize = require('sequelize');
var sequelize = new Sequelize('gospel', 'gospel', 'gospel', {
  host: '119.29.243.71',
  dialect: 'postgresql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  //storage: 'test.sqlite',

});

module.exports = sequelize;
