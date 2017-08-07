import glob from 'glob';
import path from 'path';
import _ from 'lodash';

export default (app) => {
  let defines = glob.sync('*/service.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '..', 'modules')
  });
  defines = _.union(defines, glob.sync('*/services/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '..', 'modules')
  }));
  app.context.services = {};
  _.forEach(defines, $define => {
    const [name, service] = require('../modules/' + $define);
    app.context.services[name] = service;
  });
};