'use strict';

var models = require('./');

models.sequelize.sync({force: true})
.then(function() {
    models.User.create({
      id: '122',
      name: 'John',
    });
    console.log('[models/initDb.js] sequelize sync success');
})
  .catch(function(err) {
    console.error('[models/initDb.js] sequelize sync fail');
    console.error(err);
    process.exit(1);
  });
