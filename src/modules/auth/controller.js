/**
 * 第一次获取token的方法，
 */
import passport from 'koa-passport';
import jwt from './../jwt/controller';

async function logout(ctx) {
  ctx.logout();
  ctx.body = '已登出';
};

async function login(ctx, next) {
  let middleware = await passport.authenticate('local', async (err, customer) => {
    if (err) { return next(err); };
    if (!customer) {
      ctx.status = 400;
      ctx.body = customer;
    } else {
      await ctx.login(customer);
      const tokenJson = await jwt.getToken(customer);
      ctx.body = tokenJson;
    }
  });
  await middleware.call(this, ctx, next);
};

module.exports.register = ({unauth}) => {
  unauth.get('/auth/logout', logout);
  unauth.post('/auth/login', login);
};