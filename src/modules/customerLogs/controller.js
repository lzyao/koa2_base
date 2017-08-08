/**
 * 用户日志
 */
import mongoose from 'mongoose';

// 插入用户登录日志
const addCustomerLoginLogs = async (customerLos) => {
  const CustomerLogs = mongoose.model('CustomerLogs');
  await CustomerLogs.create(customerLos);
};

module.exports.addCustomerLoginLogs = addCustomerLoginLogs;

module.exports.register = ({ router }) => {
};