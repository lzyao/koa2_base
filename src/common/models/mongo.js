import Promise from 'bluebird';
import mongoose from 'mongoose';

import config from './../../modules/util/config';
import models from './models';

mongoose.set('debug', true);

mongoose.Promise = Promise;

/**
 * Create the database connection
 */
export default () => {
  models();
  return mongoose.connect(config.mongodb, {
    poolSize: 20,
    reconnectTries: Number.MAX_VALUE
  });
};

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  const connection = mongoose.connections[0];
  console.log('Mongoose default connection opened', connection.name);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log('Mongoose default connection error: ', err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});