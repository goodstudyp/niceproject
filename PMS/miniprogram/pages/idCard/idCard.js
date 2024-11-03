Page({
  data: {
    image_url: '/image/idCard.png',
    photoPath: '',
    base64Data: '',
    accessToken: '',
    type:'',
    size_w:'',
    size_h:'',
    showReceiptBlock: false, // 是否显示回执块
   showCarousel: false, // 是否显示轮播图
   carouselImages: [],
   selectedColor: '选择颜色',
   

  },

  onLoad(options) {
   
    const sizedemo = options.sizedemo;
    this.setData({
      sizedemo: sizedemo,
    });
    console.log('接收到的sizedemo参数:', sizedemo);
    
    const app = getApp();

    this.setData({
      type: app.globalData.type ,
      size_w:app.globalData.size.width,
      size_h:app.globalData.size.height

    });
    if (this.data.type) {
      console.log("456pxl"+this.data.type)
      this.updateDisplayBasedOnType(this.data.type);
    }
    
  },

  image: function (e) {
    let that = this;
    var type;

    if (e.currentTarget.dataset.info === 'upload') {
      type = ['album'];

      my.chooseImage({
        sourceType: type,
        sizeType: ['original'],
        success: function (res) {
          console.log(res);

          // 设置照片路径
          that.setData({
            photoPath: res.apFilePaths[0]
          });

          // 显示加载动画
          my.showLoading({
            content: '上传图片中',
            mask: true
          });

          // 获取图片信息
          that.checkImageSize(that.data.photoPath, (size) => {
            if (size > 4 * 1024 * 1024) { // 超过4MB
              that.compressImage(that.data.photoPath, (compressedPath) => {
                // 获取 accessToken 并处理压缩后的图片
                that.getAccessToken((accessToken) => {
                  that.processImage(compressedPath, accessToken);
                });
              });
            } else {
              // 获取 accessToken 并处理原始图片
              that.getAccessToken((accessToken) => {
                that.processImage(that.data.photoPath, accessToken);
              });
            }
          });
        },
        fail: function (err) {
          console.log(err);
        }
      });
    } else {
      // 跳转到拍照页面
      my.navigateTo({
        url: '/pages/camera/index'
      });
    }
  },

  // 检查图片大小
  checkImageSize(filePath, callback) {
    my.getFileSystemManager().getFileInfo({
      filePath: filePath,
      success: (res) => {
        console.log('图片大小:', res.size);
        callback(res.size);
      },
      fail: (err) => {
        console.error('获取文件信息失败:', err);
      }
    });
  },

  // 压缩图片
  compressImage(filePath, callback) {
    my.compressImage({
      apFilePaths: [filePath],
      compressLevel: 1, // 设置压缩等级
      success: (res) => {
        console.log('压缩后的图片路径:', res.apFilePaths[0]);
        callback(res.apFilePaths[0]);
      },
      fail: (err) => {
        console.error('压缩图片失败:', err);
      }
    });
  },

  // 获取 Access Token
  getAccessToken(callback) {
    my.zphoto.callFunction({
      name: 'getvoucher',
      success: (res) => {
        console.log('云函数调用成功: ', res);
        const accessToken = res.result;
        console.log('获取的 Access Token: ', accessToken);
        this.setData({
          accessToken: accessToken
        });
        if (callback) {
          callback(accessToken);
        }
      },
      fail: (err) => {
        console.error('云函数调用失败: ', err);
        my.alert({ content: '云函数调用失败，请检查网络和云函数配置' });
      },
      complete: function () {
        my.hideLoading();
      }
    });
  },

  processImage(photoPath, accessToken) {
    console.log('开始处理照片:', photoPath);

    my.getFileSystemManager().readFile({
      filePath: photoPath,
      encoding: 'base64',
      success: (fileRes) => {
        const base64Data = fileRes.data;
        this.setData({
          base64Data: base64Data
        });

        // 调用 Baidu API 之前显示加载动画
        my.showLoading({
          content: '处理图片中...'
        });

        this.callBaiduApi(base64Data, accessToken);
      },
      fail: (err) => {
        console.error('读取图片文件失败:', err);
      }
    });
  },

  callBaiduApi(base64Data, accessToken) {
    const encodedBase64Data = encodeURIComponent(base64Data);
    console.log('调用 Baidu API 进行处理...');

    my.request({
      url: `https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg?access_token=${accessToken}`,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `image=${encodedBase64Data}&type=foreground`,
      success: (res) => {
        console.log('Baidu 人像分割 API 响应:', res.data);

        getApp().globalData.photo1 = res.data.foreground;

        // 隐藏加载动画
        my.hideLoading();

        if (res.data.foreground) {
          my.navigateTo({
            url: '/pages/idCard_check/idCard_check'
          });
        }
      },
      fail: (err) => {
        console.error('调用 Baidu API 失败:', err);
        // 隐藏加载动画
        my.hideLoading();
      }
    });
  },
  initCarouselImages: function() {
    // 这里是初始化轮播图图片数组的示例，你需要根据实际情况来设置图片路径
    const carouselImages = [
      '/image/photo1demo.png',
      '/image/photo2.png',
      '/image/carousel3.png'
    ];
    this.setData({
      carouselImages: carouselImages
    });
  },
  updateDisplayBasedOnType: function(type) {
    if (type.includes('回执')) {
      this.setData({
        showReceiptBlock: true,
        showCarousel: false
      });
    } else {
      this.setData({
        showReceiptBlock: false,
        showCarousel: true
      });
      // 如果显示轮播图，初始化轮播图图片数组
      this.initCarouselImages();
    }
  },
  selectColor: function(e) {
    const selectedColor = e.currentTarget.dataset.color;
    getApp().globalData.color = selectedColor;
    console.log(`已选择颜色: ${selectedColor}`);
   
    this.setData({
      color: selectedColor,
      selectedColor: selectedColor // 更新选中的颜色
    });
  },

});
