import Promise from 'bluebird';

import config from './../../modules/util/config';
import mongo from './mongo';

export default () => {
  const db = [];
  if (config.mongodb) {
    db.push(mongo());
  }
  return Promise.all(db);
};