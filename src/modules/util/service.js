/**
 * 公共方法
 */
const svc = {
  /**
   *  接口公共返回方法
   *  @param {Number} status       状态 0 成功  1  失败
   *  @param {JSON} data           返回的数据
   *  @param {Number} tokenValid   token是否过期 0 不过期 1 过期
   *  @param {String} msg          返回的错误信息
   */
  returnBody: (status, tokenValid, data, message) => {
    return {status: status, tokenValid: tokenValid, data: data, msg: message};
  }
};

module.exports = ['service', svc];
