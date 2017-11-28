/**
 * 登录时 第一次生成token
 */
import jwt from 'jwt-simple';
import moment from 'moment';
import mongoose from 'mongoose';
import config from './../util/config';
import service from './../util/service';
const returnBody = service[1].returnBody;

const getToken = async (user, next) => {
  const tokenString = config.app.token.keys;
  // 设置token有效期
  var expires = moment().add(1, 'd').valueOf();
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
  if (/^\/[^api]/.test(ctx.request.url)) {
    await next();
  } else {
    // Parse the URL, we might need this
    // 解析url地址
    const { query, body, headers } = ctx.request;
    const tokenString = config.app.token.keys;
    const Customer = mongoose.model('Customer');
    /**
     * Take the token from:
     *  - the POST value token
     *  - the GET parameter token
     *  - the access-token header
     *    ...in that order.
     */
    var token = (body && body.token) || query.token || headers['access-token'];
    if (!query.version || query.version !== 'v1') {
      ctx.body = returnBody(1, 0, {}, '版本信息错误');
      return;
    }
    // 如果token存在
    if (token) {
      try {
        // 使用密钥解析token
        var decoded = jwt.decode(token, tokenString);
        // 判断token过期时间  如果过期返回状态400
        if (decoded.exp <= Date.now()) {
          ctx.body = returnBody(1, 1, {}, 'token失效');
        } else {
          // 没有过期 根据解析出的内容 查询数据库是否存在
          await Customer.findOne({ '_id': decoded.iss })
          .then(async (customer) => {
            if (customer) {
              customer.phone = undefined;
              customer.password = undefined;
              ctx.req.customer = customer;  // 如果数据库存在，将查询到用户信息附加到请求上
              await next();
            } else {
              ctx.body = returnBody(1, 1, {}, 'token解析失败');
            }
          });
        }
      } catch (err) {
        console.log(err);
        ctx.body = returnBody(1, 1, {}, 'token解析失败');
      }
    } else {
      ctx.body = returnBody(1, 1, {}, 'token不存在');
    }
  }
};

module.exports.getToken = getToken;
module.exports.decryToken = decryToken;

module.exports.register = ({ router }) => {
};