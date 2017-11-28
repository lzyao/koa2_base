/**
 * 日志记录
 */
import bunyan from 'bunyan';
import config from './config';

const isProduction = process.env.NODE_ENV === 'production';

const options = {
  name: 'Followup_Backend',
  level: 'debug'
};

if (isProduction) {
  options.streams = [{
    type: 'rotating-file',
    path: config.app.log,
    period: '1d',   // daily rotation
    level: 'debug',
    count: 14        // keep 2-weeks back copies
  }];
} else {
  options.src = true;
  options.serializers = bunyan.stdSerializers;
}

export default bunyan.createLogger(options);