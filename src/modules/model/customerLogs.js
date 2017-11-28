
module.exports.mongo = (Schema) => {
  const CustomerLogsSchema = new Schema({
    customer: {
      type: Schema.ObjectId,
      ref: 'Customer',
      comment: '用户id'
    },
    date: {
      type: Date,
      comment: '登录时间'
    },
    type: {
      type: String,
      comment: '登录类型'
    },
    username: {
      type: String,
      comment: '登录用户名'
    },
    ip: {
      type: String,
      comment: '请求ip'
    },
    result: {
      type: String,
      comment: '登录结果'
    }
  });
  return ['CustomerLogs', CustomerLogsSchema];
};