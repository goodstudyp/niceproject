const cloud = require("@alipay/faas-server-sdk");
// 获取 cloud 环境中的 mongoDB 数据库对象
const db = cloud.database();

exports.main = async (event, context) => {
  const open_id = event
  db.collection('user_photo').where({_openid: open_id }).get().then(res => {
    if (res.data.length > 0) {
      const userFiles = res.data;
      this.downloadPhotos(userFiles);
    } else {
      this.setData({
        listShow: false
      });
    }
    console.log("查询结果:", res.data);
  }).catch(err => {
    console.error("查询失败:", err);
  });
};