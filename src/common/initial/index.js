
var Promise = require('bluebird');
var mongoose = require('mongoose');

module.exports = async function init() {
  var Customer = mongoose.model('Customer');
  var admin;
  admin = await Customer.findOne({
    role: 5
  });
  if (!admin) {
    admin = await Customer.create({
      name: '系统管理员',
      username: 'admin',
      role: 5,
      password: 'admin'
    });
  }
  return Promise.resolve();
};