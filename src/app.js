import Koa from 'koa';
const app = new Koa();
import responseTime from 'koa-response-time';
import Router from 'koa-router';
import logger, { requestIdContext, requestLogger, timeContext } from 'koa-bunyan-logger';
import { pick, merge, trimEnd } from 'lodash';
import bytes from 'bytes';
import cors from 'koa-cors';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';

import config from './modules/util/config';
import registerCtrl from './common/controllers';
import initial from './common/initial';
import models from './common/models/';
import services from './common/services';
import bunyan from './modules/util/log';

import token from './modules/controller/jwt';  // implement login and logout method

const prefix = { prefix: '/api' };

const unauthRouter = new Router(prefix);  // create a new router 创建一个新的路由
const publicRouter = new Router(prefix);
app.use(responseTime());

app.use(logger(bunyan));
app.use(requestIdContext({
  header: 'Request-Id'
}));
app.use(convert(cors({
  origin: true,
  credentials: true,
  headers: ['Content-Type', 'accept', 'X-CLOUD-TOKEN', 'token'],
  expose: ['Total', 'X-Response-Time', 'Content-Disposition']
})));

app.use(requestLogger({
  durationField: 'responseTime',
  updateRequestLogFields: (ctx) => {
    return pick(ctx.req.headers, ['host', 'referer', 'accept-encoding', 'accept-language']);
  },
  updateResponseLogFields: (ctx) => {
    const { _headers: headers } = ctx.res;
    const time = headers['x-response-time'];
    const length = bytes(headers['content-length']);
    const fields = pick(ctx.res._headers, ['host', 'content-type', 'accept-encoding', 'accept-language']);
    return merge(fields, {
      responseTime: trimEnd(time, 'ms'),
      bodySize: length ? bytes(length) : '-'
    });
  }
}));
app.use(timeContext({ logLevel: 'debug' }));

app.keys = [config.app.session.keys];
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  extendTypes: {
    text: ['text/xml'] // will parse application/x-javascript type body as a JSON string
  },
  multipart: true,
  textLimit: '100mb',
  jsonLimit: '100mb',
  formLimit: '100mb'
}));

// 加载所有路由
registerCtrl({
  unauth: unauthRouter,
  router: publicRouter
});

app.use(unauthRouter.routes());
app.use(token.decryToken);
app.use(publicRouter.routes());

// catch all exceptions  捕获所有异常
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) ctx.throw(404);
  } catch (err) {
    console.log(err);
    ctx.status = err.status || 500;
    ctx.body = {message: err.message, success: false};
  };
});

services(app);
models().then(() => {
  const port = config.app.port;
  app.listen(port, async function () {
    await initial();
    console.log('Server started on', port);
  });
});