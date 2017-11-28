/**
 * 第一次获取token的方法，
 */
import jwt from './jwt';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import _ from 'lodash';
import logs from './customerLog';
import service from './../util/service';

async function logout(ctx) {
  ctx.body = '登出成功';
};

async function login(ctx, next) {
  const {username, password, type} = ctx.request.body;
  const Customer = mongoose.model('Customer');
  let ip = ctx.req.headers['x-forwarded-for'] ||
    ctx.req.connection.remoteAddress ||
     ctx.req.socket.remoteAddress ||
     ctx.req.connection.socket.remoteAddress;
  const customer = await Customer.findOne({ 'username': username });
  let customerLogs = {
    type: type, date: new Date(), username: username, ip: ip
  };
  if (!customer) {
    _.merge(customerLogs, {result: '用户名不存在'});
    await logs.addCustomerLoginLogs(customerLogs);
    ctx.body = service[1].returnBody(1, 0, {}, '用户名不存在');
  } else {
    // 判断密码是否正确
    await bcrypt.compare(password, customer.password).then(async (res) => {
      if (!res) {
        _.merge(customerLogs, {result: '密码错误'});
        await logs.addCustomerLoginLogs(customerLogs);
        ctx.body = service[1].returnBody(1, 0, {}, '密码错误');
      } else {
        // 清空密码
        customer.password = undefined;
        // 生成token
        const tokenJson = await jwt.getToken(customer);
        _.merge(customerLogs, {customer: customer._id, result: '登录成功'});
        await logs.addCustomerLoginLogs(customerLogs);
        ctx.body = service[1].returnBody(0, 0, tokenJson, 'ok');
      }
    });
  }
};

module.exports.register = ({unauth}) => {
  unauth.get('/auth/logout', logout);
  unauth.post('/auth/login', login);
};