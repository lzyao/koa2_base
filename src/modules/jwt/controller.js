/**
 * 登录时 第一次生成token
 */
import jwt from 'jwt-simple';
import moment from 'moment';
import config from './../util/config';

const getToken = async (user, next) => {
  const tokenString = config.app.token.keys;
  // 设置token有效期
  var expires = moment().add('days', 3).valueOf();
  // 生成token
  var token = await jwt.encode(
    {
      iss: user._id,
      exp: expires
    }, tokenString
  );
  return {
    token: token,
    expires: expires,
    user: user.toJSON()
  };
};

module.exports.getToken = getToken;

module.exports.register = ({routers}) => {
};