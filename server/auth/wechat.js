var request = require('request');
var config = require('./config');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits,
var _ = require('lodash');

function WXLogin = function (param){
  EventEmitter.call(this);
  this.config = config;
  _.merge(config,param);
}

inherits(WXLogin,EventEmitter);

WXLogin.prototype.route = function() {

}

WXLogin.prototype.connect = function() {

}
