/**
 * jwtauth
 *
 *  A simple middleware for parsing a JWt token attached to the request. If the token is valid, the corresponding user
 *  will be attached to the request.
 *  捕获每一个需要验证用户的的请求  通过jwt解析相应的token，如果token有效，将解析后的用户信息附加到请求信息上
 */

/**
 * 验证请求中token合法性
 */
import jwt from 'jwt-simple';
import mongoose from 'mongoose';
import config from './../util/config';

const decryToken = async (ctx, next) => {
  // Parse the URL, we might need this
  // 解析url地址
  const { query, body, headers } = ctx.request;
  const tokenString = config.app.token.keys;
  const User = mongoose.model('User');
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
        ctx.res.end('Access token has expired', 400);
      }
      // 没有过期 根据解析出的内容 查询数据库是否存在
      await User.findOne({ '_id': decoded.iss }, (err, user) => {
        if (!err) {
          ctx.req.user = user;  // 如果数据库存在，将查询到用户信息附加到请求上
          return next();
        }
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }
};


module.exports.decryToken = decryToken;