import bcrypt from 'bcrypt';

module.exports.mongo = (Schema) => {
  const CustomerSchema = new Schema({
    username: {
      type: String,
      comment: '用户名'
    },
    password: {
      type: String,
      comment: '密码'
    },
    name: {
      type: String,
      comment: '姓名'
    },
    phone: {
      type: String,
      comment: '联系电话'
    },
    email: {
      type: String,
      comment: '联系邮箱'
    },
    role: {
      type: Number,
      comment: '角色'
    }
  });
  CustomerSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    var salt = bcrypt.genSaltSync(10);
    var hash;
    hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
    next();
  });
  return ['Customer', CustomerSchema];
};