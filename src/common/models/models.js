import glob from 'glob';
import path from 'path';
import _ from 'lodash';
import mongoose from 'mongoose';
import pagination from 'mongoose-paginate';
import timestamps from 'mongoose-timestamp';

pagination.paginate.options = {
  lean: true,
  limit: 20 // default limit to 20
};

const FileSchema = new mongoose.Schema({}, { strict: false, collection: 'fs.files' });

export default () => {
  let defines = glob.sync('model/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '../..', 'modules/')
  });
  defines = _.union(defines, glob.sync('model/*.js', {
    root: 'modules',
    cwd: path.resolve(__dirname, '../..', 'modules/')
  }));
  console.log('controller', defines);
  console.log('-------------------------');
  defines.forEach(function (define) {
    const { mongo } = require('../../modules/' + define);
    if (!mongo) return;
    const [name, schema] = mongo(mongoose.Schema);
    schema.plugin(pagination);
    schema.plugin(timestamps);
    schema.set('toJSON', {
      versionKey: false,
      virtuals: true, // 虚拟字段
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    });
    mongoose.model(name, schema);
  });
  mongoose.model('File', FileSchema);
};