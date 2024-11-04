Page({
  data: {
    userFile: [],
    open_id: '',
    listShow: true
  },

  onLoad() {
    this.checkOpenId();
  },

  onShow() {
    // 每次进入页面时刷新数据
    this.refreshData();
  },

  // 添加下拉刷新配置
  onPullDownRefresh() {
    this.refreshData();
  },

  // 刷新数据的统一方法
  async refreshData() {
    const open_id = my.getStorageSync({ key: 'open_id' }).data;
    if (open_id) {
      await this.getUserFiles(open_id);
      // 停止下拉刷新动画
      my.stopPullDownRefresh();
    } else {
      this.fetchOpenId();
    }
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
      const res = await db.collection('user_photo')
        .where({ open_id })
        .orderBy('uploadTime', 'desc')
        .get();

      console.log("从数据库获取的用户文件:", res);

      if (res.length > 0) {
        // 从本地存储获取缓存的照片数据
        const cachedPhotos = my.getStorageSync({ key: 'cachedPhotos' }).data || {};
        
        const userFiles = res.map(file => {
          // 检查是否有缓存的照片
          const cachedPhoto = cachedPhotos[file.photo2FileId];
          return {
            fileContent: cachedPhoto ? cachedPhoto.fileContent : null,
            photo2FileId: file.photo2FileId,
            uploadTime: file.uploadTime,
            type: file.photo_type,
            order_number: file.order_number,
            status: file.status || (file.photo_type.includes('回执') ? '回执认证中' : '订单完成')
          };
        });

        this.setData({ userFile: userFiles });

        // 只下载没有缓存的照片
        const uncachedFiles = userFiles.filter(file => !file.fileContent);
        if (uncachedFiles.length > 0) {
          await this.downloadUserFiles(uncachedFiles);
        }
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

  async downloadUserFiles(uncachedFiles) {
    my.showLoading({ content: '加载中...', delay: 100 });

    try {
      const cachedPhotos = my.getStorageSync({ key: 'cachedPhotos' }).data || {};

      const downloadPromises = uncachedFiles.map(async (file) => {
        const fileContent = await this.downloadPhoto(file.photo2FileId);
        if (fileContent) {
          // 更新数据显示
          const index = this.data.userFile.findIndex(f => f.photo2FileId === file.photo2FileId);
          this.setData({
            [`userFile[${index}].fileContent`]: fileContent
          });

          // 更新缓存
          cachedPhotos[file.photo2FileId] = {
            fileContent
          };
        }
      });

      await Promise.all(downloadPromises);

      // 保存更新后的缓存
      my.setStorageSync({
        key: 'cachedPhotos',
        data: cachedPhotos
      });

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
    
    console.log("跳转时的状态:", file.status);

    my.navigateTo({
      url: `/pages/details/details?photo2Path=${encodeURIComponent(file.fileContent)}&fileID=${encodeURIComponent(file.photo2FileId)}&status=${encodeURIComponent(file.status)}&type=${encodeURIComponent(file.type)}`
    });
  },

  handleDelete(e) {
    const index = e.currentTarget.dataset.index;
    const file = this.data.userFile[index];

    my.confirm({
      title: '删除提示',
      content: '确定要删除这个订单吗？删除后无法恢复',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      success: async (result) => {
        if (result.confirm) {
          await this.deleteOrder(file);
        }
      }
    });
  },

  async deleteOrder(file) {
    try {
      my.showLoading({ content: '正在删除...' });

      // 1. 删除云存储中的照片
      if (file.photo2FileId) {
        await my.zphoto.deleteFile({
          fileList: [file.photo2FileId]
        });
      }

      // 2. 删除数据库中的记录
      const db = my.zphoto.database();
      await db.collection('user_photo').where({
        photo2FileId: file.photo2FileId
      }).remove();

      // 3. 删除本地缓存
      const cachedPhotos = my.getStorageSync({ key: 'cachedPhotos' }).data || {};
      delete cachedPhotos[file.photo2FileId];
      my.setStorageSync({
        key: 'cachedPhotos',
        data: cachedPhotos
      });

      // 4. 从确认照片缓存中删除
      const confirmedPhotos = my.getStorageSync({ key: 'confirmedPhotos' }).data || {};
      delete confirmedPhotos[file.photo2FileId];
      my.setStorageSync({
        key: 'confirmedPhotos',
        data: confirmedPhotos
      });

      my.hideLoading();
      my.showToast({
        type: 'success',
        content: '删除成功'
      });

      // 刷新列表
      this.refreshData();

    } catch (error) {
      console.error('删除失败:', error);
      my.hideLoading();
      my.showToast({
        type: 'fail',
        content: '删除失败'
      });
    }
  }
});