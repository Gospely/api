var util = require('../utils.js');
var users = {};


users.login = function* (){
  
  console.log('login');
  this.body = 'login success';
}

module.exports = users;
