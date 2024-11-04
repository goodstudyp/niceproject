Page({
  data: {
    photo2Path: '',
    photo3Path: '',
    status: '',
    type: '',
    isConfirmed: false
  },

  onLoad(options) {
    const photo2Path = decodeURIComponent(options.photo2Path);
    const fileID = decodeURIComponent(options.fileID);
    const status = decodeURIComponent(options.status);
    const type = decodeURIComponent(options.type);
    
    // 检查该照片是否已确认
    const confirmedPhotos = my.getStorageSync({ key: 'confirmedPhotos' }).data || {};
    const isConfirmed = confirmedPhotos[fileID] || false;
    
    this.setData({
      photo2Path,
      status,
      type,
      isConfirmed,
      fileID  // 保存 fileID 用于标识照片
    });

    // 只有带回执的照片才需要下载 photo3
    if (type.includes('回执')) {
      const photo3FileID = fileID.replace('photo2.jpg', 'photo3.jpg');
      this.downloadPhoto(photo3FileID).then(photo3Path => {
        if (photo3Path) {
          this.setData({ photo3Path });
        }
      });
    }
  },

  handleConfirm() {
    my.confirm({
      title: '确认提示',
      content: '确认照片后将无法重新拍摄，是否确认？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          // 更新本地存储
          const confirmedPhotos = my.getStorageSync({ key: 'confirmedPhotos' }).data || {};
          confirmedPhotos[this.data.fileID] = true;
          my.setStorageSync({
            key: 'confirmedPhotos',
            data: confirmedPhotos
          });

          this.setData({ isConfirmed: true });
          my.showToast({
            type: 'success',
            content: '照片已确认'
          });
        }
      }
    });
  },

  // 处理照片下载 - 直接使用 photo2Path
  handlePhotoDownload() {
    try {
      my.showLoading({
        content: '正在下载照片...'
      });

      // 直接保存图片到相册
      my.saveImage({
        url: this.data.photo2Path,
        success: () => {
          my.hideLoading();
          my.showToast({
            type: 'success',
            content: '照片已保存到相册'
          });
        },
        fail: (err) => {
          console.error('保存图片失败:', err);
          my.hideLoading();
          my.showToast({
            type: 'fail',
            content: '保存失败'
          });
        }
      });
    } catch (error) {
      console.error('下载照片失败:', error);
      my.hideLoading();
      my.showToast({
        type: 'fail',
        content: '下载失败'
      });
    }
  },

  handleRetake() {
    my.navigateTo({
      url: '/pages/camera/camera'
    });
  },

  // 下载回执照片的方法
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
