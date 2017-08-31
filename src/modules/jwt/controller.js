/**
 * 登录时 第一次生成token
 */
import jwt from 'jwt-simple';
import moment from 'moment';
import mongoose from 'mongoose';
import config from './../util/config';

const getToken = async (user, next) => {
  const tokenString = config.app.token.keys;
  // 设置token有效期
  var expires = moment().add(1, 'm').valueOf();
  // 生成token
  var token = await jwt.encode(
    {
      iss: user._id,
      exp: expires
    }, tokenString
  );
  return {
    token: token,
    user: user.toJSON()
  };
};

const decryToken = async (ctx, next) => {
  // Parse the URL, we might need this
  // 解析url地址
  const { query, body, headers } = ctx.request;
  const tokenString = config.app.token.keys;
  const Customer = mongoose.model('Customer');
  /**
   * Take the token from:
   *  - the POST value access_token
   *  - the GET parameter access_token
   *  - the x-access-token header
   *    ...in that order.
   */
  var token = (body && body.access_token) || query.access_token || headers['x-access-token'];
  // 如果token存在
  if (token) {
    try {
      // 使用密钥解析token
      var decoded = jwt.decode(token, tokenString);
      // 判断token过期时间  如果过期返回状态400
      if (decoded.exp <= Date.now()) {
        // ctx.req.user = '';
        // ctx.res.end('Access token has expired', 400);
        ctx.body = {success: 'false', message: 'token失效'};
      } else {
        // 没有过期 根据解析出的内容 查询数据库是否存在
        await Customer.findOne({ '_id': decoded.iss })
        .then(async (user) => {
          if (user) {
            user.password = undefined;
            ctx.req.user = user;  // 如果数据库存在，将查询到用户信息附加到请求上
            await next();
          }
        });
      }
    } catch (err) {
      ctx.status = 400;
      ctx.body = {success: 'false', message: 'token解析失败'};
    }
  };
};

module.exports.getToken = getToken;
module.exports.decryToken = decryToken;

module.exports.register = ({ router }) => {
};