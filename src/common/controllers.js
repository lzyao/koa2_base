import glob from 'glob';
import path from 'path';
import _ from 'lodash';

export default (routers) => {
  let defines = glob.sync('controller/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '..', 'modules/')
  });
  defines = _.union(defines, glob.sync('controller/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '..', 'modules/')
  }));
  console.log('model', defines);
  console.log('-------------------------');
  _.forEach(defines, $define => {
    const ctl = require('../modules/' + $define);
    ctl.register(routers);
  });
};