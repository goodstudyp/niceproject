Page({
  data: {
    photo2Path: '',
    photo3Path: '',
    status: '',
    type: ''
  },

  onLoad(options) {
    const photo2Path = decodeURIComponent(options.photo2Path);
    const fileID = decodeURIComponent(options.fileID);
    const status = decodeURIComponent(options.status);
    const type = decodeURIComponent(options.type);
    
    // 替换 fileID 中的 photo2.jpg 为 photo3.jpg
    const photo3FileID = fileID.replace('photo2.jpg', 'photo3.jpg');
    
    this.setData({
      photo2Path,
      status,
      type
    });

    // 下载 photo3
    this.downloadPhoto(photo3FileID).then(photo3Path => {
      if (photo3Path) {
        this.setData({ photo3Path });
      }
    });
  },

  async downloadPhoto(fileID) {
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

  handleDownload() {
    switch(this.data.status) {
      case '回执认证中':
        my.showToast({
          type: 'none',
          content: '回执认证中，请稍后再试',
          duration: 2000
        });
        break;
      
      case '不合格':
        my.showToast({
          type: 'fail',
          content: '你的回执不合格，请重新拍摄',
          duration: 2000
        });
        break;
      
      case '订单完成':
        // 这里添加下载回执的逻辑
        this.downloadReceipt();
        break;
    }
  },

  handleRetake() {
    my.navigateTo({
      url: '/pages/camera/camera'
    });
  },

  async downloadReceipt() {
    try {
      my.showLoading({
        content: '正在下载回执...'
      });

      // TODO: 实现实际的下载逻辑
      
      my.hideLoading();
      my.showToast({
        type: 'success',
        content: '下载成功'
      });
    } catch (error) {
      my.hideLoading();
      my.showToast({
        type: 'fail',
        content: '下载失败'
      });
      console.error('下载回执失败:', error);
    }
  }
});
