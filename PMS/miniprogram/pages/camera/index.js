Page({
  data: {
    position: 'back',  
    photoPath: '',  
    base64Data: '',  
    accessToken: '' 
  },

  onLoad(options) {
   
  
      this.cameraContext = my.createCameraContext('camera'); 
    },
  

  takePhoto: function (e) {
    my.showLoading({
      content:'拍照中'
    })
    console.log("拍照");
    if (this.cameraContext) {
      this.cameraContext.takePhoto({
        success: (res) => {
          console.log(res.tempImagePath);
          my.hideLoading();
          this.setData({
            photoPath: res.tempImagePath
          });
          
        
        },
        fail: (err) => {
          console.error("拍照失败：", err);
        }
      });
    } else {
      console.error("相机尚未初始化完成！");
    }
  },

  uploadphoto:function(e){
    this.getAccessToken((accessToken) => {
      this.processImage(this.data.photoPath, accessToken);
    });
    
  },

  swap_position: function (e) {
    console.log("切换相机");
    let newPosition = this.data.position === 'back' ? 'front' : 'back';
    this.setData({
      position: newPosition
    });
    console.log(newPosition);
  },

 
  getAccessToken(callback) {
    my.showLoading({
      content:'修图中'
    })
    my.zphoto.callFunction({
      name: 'getvoucher',
      success: (res) => {
        console.log('云函数调用成功: ', res);
        const accessToken = res.result;
        console.log('获取的Access Token: ', accessToken);
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

  retakePhoto: function (e) {
    console.log("重新拍照");
    this.setData({
      photoPath: ''
    });
  },

 
  processImage(photoPath, accessToken) {
    console.log('开始处理图片');



    
   
    my.showLoading({
      content: '图片处理中...',
      mask: true
    });
    
    // 强制显示2秒后隐藏加载提示框
    setTimeout(() => {
      my.hideLoading();
    }, 50000)
  
    my.getFileSystemManager().readFile({
      filePath: photoPath,
      encoding: 'base64',
      success: (fileRes) => {
        const base64Data = fileRes.data;
        this.setData({
          base64Data: base64Data
        });
        console.log('图片的Base64编码：', base64Data);
        console.log('使用的Access Token：', accessToken);
  
        const encodedBase64Data = encodeURIComponent(base64Data);
  
        my.request({
          url: `https://aip.baidubce.com/rest/2.0/image-classify/v1/body_seg?access_token=${accessToken}`,
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: `image=${encodedBase64Data}&type=foreground`,
          success: (res) => {
            console.log('人像分割 API 响应:', res.data);
  
            getApp().globalData.photo1 = res.data.foreground;
            this.setData({
              photoPath: ''  
          });

          
  
            if (res.data.foreground) {
              // this.saveForegroundImage(res.data.foreground);

             


              
                my.hideLoading();
              

              my.hideLoading();
              my.navigateTo({
                url: '/pages/idCard_check/idCard_check'  
              });

              
            }
  
            
           
          },
          fail: (err) => {
            console.error('调用人像分割 API 失败:', err);
  
            
           
          }
        });
      },
      fail: (err) => {
        console.error('读取图片文件失败:', err);
  
        // 读取文件失败后隐藏加载提示
        my.hideLoading();
      }
    });
  },


  saveForegroundImage(foregroundImageBase64) {
   
    my.saveImageToPhotosAlbum({
      filePath: `data:image/png;base64,${foregroundImageBase64}`,
      success: () => {
        console.log('前景人像图保存成功');
      },
      fail: (err) => {
        console.error('保存前景人像图失败:', err);
      }
    });
  }
});
