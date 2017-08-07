const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
import jwt from './../jwt/controller';

passport.serializeUser(function (customer, done) {
  done(null, customer.id);
});
passport.deserializeUser(async function (id, done) {
  const customer = await mongoose.model('Customer').findById(id);
  done(null, customer);
});

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async function (username, password, done) {
  const Customer = mongoose.model('Customer');
  const customer = await Customer.findOne({ 'username': username });
  if (!customer) {
    return done(null, {
      success: false,
      message: '用户不存在'
    });
  }
  await bcrypt.compare(password, customer.password, async function (err, res) {
    if (err || !res) {
      return done(null, {
        success: false,
        message: '密码错误'
      });
    }
    customer.password = undefined;
    return done(null, customer);
  });
}));