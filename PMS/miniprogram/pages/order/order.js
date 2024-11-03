Page({
  data: {
    userFile: [],
    open_id: '',
    listShow: true
  },

  onLoad() {
    this.checkOpenId();
  },

  checkOpenId() {
    const open_id = my.getStorageSync({ key: 'open_id' }).data;
    if (open_id) {
      console.log("获取到本地缓存的 open_id:", open_id);
      this.getUserFiles(open_id);
    } else {
      this.fetchOpenId();
    }
  },

  async getUserFiles(open_id) {
    const db = my.zphoto.database();
    try {
      // 获取数据并按上传时间降序排序
      const res = await db.collection('user_photo')
        .where({ open_id })
        .orderBy('uploadTime', 'desc')
        .get();

      console.log("从数据库获取的用户文件:", res);

      if (res.length > 0) {
        const userFiles = res.map(file => ({
          fileContent: null,
          photo2FileId: file.photo2FileId,
          uploadTime: file.uploadTime,
          type: file.photo_type,
          order_number: file.order_number,
          status: file.status || (file.photo_type.includes('回执') ? '回执认证中' : '订单完成')
        }));

        this.setData({ userFile: userFiles });
        await this.downloadUserFiles(userFiles);
      } else {
        this.setData({ 
          userFile: [],
          listShow: false 
        });
      }
    } catch (err) {
      console.error("获取用户文件失败:", err);
      my.showToast({
        type: 'fail',
        content: '获取订单信息失败'
      });
    }
  },

  async downloadUserFiles(userFiles) {
    my.showLoading({ content: '加载中...', delay: 100 });

    try {
      const downloadPromises = userFiles.map((file, index) => 
        this.downloadPhoto(file.photo2FileId)
          .then(fileContent => {
            if (fileContent) {
              this.setData({
                [`userFile[${index}].fileContent`]: fileContent
              });
            }
          })
      );

      await Promise.all(downloadPromises);
    } catch (err) {
      console.error("下载照片时发生错误:", err);
    } finally {
      my.hideLoading();
    }
  },

  async downloadPhoto(fileID) {
    if (!fileID) return null;
    
    const randomSuffix = Math.floor(Math.random() * 10000);
    const userPath = `${my.env.USER_DATA_PATH}/img_${randomSuffix}.jpg`;

    try {
      const res = await my.zphoto.downloadFile({
        fileID,
        filePath: userPath
      });

      return res.statusCode === 200 ? userPath : null;
    } catch (error) {
      console.error("下载照片失败:", error);
      return null;
    }
  },

  fetchOpenId() {
    const authCode = getApp().globalData.authCode;
    my.zphoto.callFunction({
      name: 'getuserinfo',
      data: { authCode },
      success: (res) => {
        const open_id = res.result.open_id;
        my.setStorageSync({ key: 'open_id', data: open_id });
        this.getUserFiles(open_id);
      },
      fail: (err) => {
        console.error("获取用户信息失败:", err);
        my.showToast({
          type: 'fail',
          content: '获取用户信息失败'
        });
      }
    });
  },

  jump(e) {
    const index = e.currentTarget.dataset.index;
    const file = this.data.userFile[index];
    
    my.navigateTo({
      url: `/pages/details/details?photo2Path=${encodeURIComponent(file.fileContent)}&fileID=${encodeURIComponent(file.photo2FileId)}`
    });
  }
});