let lastPhoto2Path = '';


Page({
  data: {
    imageData: null
  },
  
  onLoad() {
    this.image_url = getApp().globalData.photo1;
    console.log("这是我的文件2"+this.image_url)
   
    this.size = getApp().globalData.size;
    this.color = getApp().globalData.color; 
    this.fileManager = my.getFileSystemManager();
    
  },


  next(e) {
    
    this.saveCanvasImage();
    // this.upload();
  },

  back() {
    getApp().globalData.photo1 = null;
    
    my.navigateBack(); 
  },

  onCanvasReady() {
    console.log("Canvas ready");
    my.createSelectorQuery().select('#canvas').node().exec((res) => {
      if (!res[0] || !res[0].node) {
        console.error('Canvas 节点获取失败');
        return;
      }
      const canvas = res[0].node;
      this.canvas = canvas;  
      const ctx = canvas.getContext('2d');
      
      const { width, height } = this.size;
      console.log(`Canvas尺寸：${width}x${height}`);
      
      canvas.width = width;
      canvas.height = height;

      this.changeCanvasBackgroundColor(ctx);

      const image = canvas.createImage();

      if (this.image_url) {
        image.src = `data:image/png;base64,${this.image_url}`;
      } else {
        console.error("没有可用的 base64 图片数据");
        return;
      }

      image.onload = () => {
        this.adaptcanvas(image.width, image.height); // 重新调整照片的尺寸适应画布
        console.log("图像的尺寸", image.width, image.height);
       
        ctx.drawImage(image, this.imageX, this.imageY, this.newimageWidth, this.newimageHeight);
        this.drawTextWatermark(ctx); 
      };

      image.onerror = (err) => {
        console.error("图片加载失败", err);
      };
    });
  },

 

    saveCanvasImage() {
    
  
    if (!this.canvas) {
      console.error("Canvas 未定义");
      return;
    }
  
    const ctx = this.canvas.getContext('2d');
    
   
    this.redrawWithoutWatermark(ctx, () => {
      my.canvasToTempFilePath({
        canvas: this.canvas,
        fileType: 'jpg',
        quality: 0.9,
        success(res) {
          console.log('保存成功', res.tempFilePath);
         getApp().globalData.photo2 = res.tempFilePath

          console.log("请看我"+getApp().globalData.photo2)

          
          
        
        },
        fail(err) {
          console.error('保存失败', err);
        }
      });
    });

    this.writeFileFromBase64();//用来将photo1转为一个路径以保存图片到服务器
   
  },
  



  //可以拿到color值改变背景颜色
  changeCanvasBackgroundColor(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    let color = 'white';
    switch (this.color) {
      case 'red':
        color = 'red';
        break;
      case 'blue':
        color = 'blue';
        break;
      case 'white':
        color = 'white';
        break;
      case 'pink':
        color = 'pink';
        break;
      case 'gray':
        color = 'gray';
        break;
      // 可以根据需要添加其他颜色
      default:
        color = 'white'; // 默认颜色
        break;
    }

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    console.log(`画布背景颜色已更改为 ${color}`);
  },
  drawTextWatermark(ctx) {
    
    ctx.font = "bold 25px 'Fira Sans'";
    ctx.fillStyle = 'rgba(255,255,255,0.6)';  
    
    
    ctx.fillText("电子相片制作", 10, 20);  
    ctx.fillText("电子相片制作", 220, 20); 
    ctx.fillText("电子相片制作", 10, 190); 
    ctx.fillText("电子相片制作", 220, 190);
    console.log("水印绘制成功");
  },
  redrawWithoutWatermark(ctx, callback) {
    console.log("重新绘制画布，不带水印");
    const image = this.canvas.createImage();
    if (this.image_url) {
      image.src = `data:image/png;base64,${this.image_url}`;
    } else {
      console.error("没有可用的 base64 图片数据");
      return;
    }
    
    image.onload = () => {
      this.adaptcanvas(image.width, image.height);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 清空画布
      this.changeCanvasBackgroundColor(ctx); // 绘制背景色
      ctx.drawImage(image, this.imageX, this.imageY, this.newimageWidth, this.newimageHeight); // 绘制主图
      console.log("图片重新绘制成功");
  
      // 重新绘制完成后调用回调函数
      if (typeof callback === 'function') {
        callback();
      }
    };
  
    image.onerror = (err) => {
      console.error("图片加载失败", err);
    };
  },

  adaptcanvas(imageWidth, imageHeight) {
    const canvasWidth = this.canvas.width;
  const canvasHeight = this.canvas.height;

  const imageAspectRatio = imageWidth / imageHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;

  if (imageAspectRatio > canvasAspectRatio) {
    

    this.newimageHeight = canvasHeight;
    this.newimageWidth = canvasHeight * imageAspectRatio;
  
  } else {
   
    this.newimageWidth = canvasWidth;
    this.newimageHeight = canvasWidth / imageAspectRatio;
  }

 
  this.imageX = (canvasWidth - this.newimageWidth) / 2;
  this.imageY = (canvasHeight - this.newimageHeight) / 2;
  },

  async upload() {
    const authCode = getApp().globalData.authCode;
    console.log("这个东西是凭证" + authCode);
  
    // 确保每次上传前都转换 photo1
    // await this.writeFileFromBase64();
  
    // 检查是否已获取过 open_id
    if (getApp().globalData.safe) {
      const storedOpenId = my.getStorageSync({ key: 'open_id' });
      console.log("我使用了本地缓存");
      if (storedOpenId) {
        this.open_id = storedOpenId.data;
        this.upload_photo(this.open_id); // 直接调用上传函数
        return;
      }
    }
  
    my.zphoto.callFunction({
      name: 'getuserinfo',
      data: {
        authCode: authCode
      },
      success: (res) => {
        console.log("云函数返回值:", res.result.open_id);
  
        getApp().globalData.safe = 1;
  
        console.log("调用getuserinfo成功");
        this.open_id = res.result.open_id;
  
        // 检查本地缓存中是否已有 open_id
        const storedOpenId = my.getStorageSync({ key: 'open_id' });
  
        if (!storedOpenId) {
          // 如果没有，则存储 open_id
          my.setStorageSync({
            key: 'open_id',
            data: this.open_id
          });
        } else {
          console.log("本地缓存中已存在 open_id:", storedOpenId);
        }
 
        this.upload_photo(this.open_id);
      },
      fail: (err) => {
        console.error("调用云函数失败:", err);
      }
    });
  },
  
  
  async upload_photo(open_id) {
    const photo1 = getApp().globalData.photo1;
    let type = getApp().globalData.type;
    let photo2 = getApp().globalData.photo2;
  
    // 持续检查 photo2 的路径，直到它与上次不同
    while (photo2 === lastPhoto2Path) {
      console.log('photo2 路径与上次相同，等待更新...');
      
      // 等待一段时间，然后再尝试更新 photo2
      await new Promise((resolve) => setTimeout(resolve, 500)); // 等待 500 毫秒
  
      // 重新获取 photo2 的路径
      photo2 = getApp().globalData.photo2;
    }
  
    // 更新 lastPhoto2Path，并执行上传操作
    lastPhoto2Path = photo2;
  
    const order_number = this.generateOrderNumber(); // 用来模拟一个订单号
    console.log("生成的订单号:", order_number);
    my.showLoading({
      content: '正在进行上传 请勿关闭小程序'
    });
  
    let cloudPath_1, cloudPath_2;
  
    if (type.includes('回执')) {
      cloudPath_1 = `photos/有回执/${type}${order_number}/photo1.jpg`;
      cloudPath_2 = `photos/有回执/${type}${order_number}/photo2.jpg`;
  
      try {
        // 上传 photo2
        const res_2 = await my.zphoto.uploadFile({
          cloudPath: cloudPath_2,
          filePath: photo2,
        });
        console.log('上传 photo2 成功，fileId:', res_2.fileID);
  
        // 上传 photo1
        const res_1 = await my.zphoto.uploadFile({
          cloudPath: cloudPath_1,
          filePath: photo1,
        });
        console.log('上传 photo1 成功，fileId:', res_1.fileID);
  
        // 在文件上传成功后调用数据库更新函数
        await this.upload_database(res_1.fileID, res_2.fileID, open_id, order_number);
      } catch (error) {
        console.error('上传失败:', error);
      }
  
    } else {
      cloudPath_2 = `photos/没有回执/${type}${order_number}/photo2.jpg`;
  
      try {
        // 仅上传 photo2
        const res_2 = await my.zphoto.uploadFile({
          cloudPath: cloudPath_2,
          filePath: photo2,
        });
        console.log('上传 photo2 成功，fileId:', res_2.fileID);
  
        // 在文件上传成功后调用数据库更新函数（这里可以根据需要调整）
        await this.upload_database(null, res_2.fileID, open_id, order_number);
      } catch (error) {
        console.error('上传失败:', error);
      }
    }
  
    // 最后再进行文件的删除操作
    await this.fileManager.unlink({
      filePath: this.data.tempFilePath,
      success(res) {
        console.log('文件删除成功:', res);
        my.switchTab({
          url: '/pages/index/index',
        });
      },
      fail(res) {
        console.error('文件删除失败:', res);
      },
    });
  },
  



writeFileFromBase64() {
 
  const base64 = getApp().globalData.photo1; 
  const filePath = my.env.USER_DATA_PATH + `/photo1.png`; 
  const cleanedBase64 = base64.replace(/^data:image\/\w+;base64,/, ""); 

  return new Promise((resolve, reject) => {
    this.fileManager.writeFile({
      filePath,
      data: my.base64ToArrayBuffer(cleanedBase64),
      encoding: 'binary',
      success: (e) => {
        console.log('写入文件成功', e);
        this.setData({
          tempFilePath: filePath 
        });
        
        my.saveFile({
          tempFilePath: filePath,
          success: (saveRes) => {
            console.log('保存成功', saveRes);
            getApp().globalData.photo1 = filePath; // 更新为文件路径
            resolve(); // 成功后调用 resolve
          },
          fail: (saveRes) => {
            console.log('保存失败', saveRes);
            reject(saveRes); // 失败后调用 reject
          },
        });
      },
      fail: (e) => {
        console.log('写入文件失败!', e);
        reject(e); // 失败后调用 reject
      },
    });
  })

  .then(() => {
    // 在写入和保存文件成功后调用 upload
    this.upload();
  })
},

// async upload_database(photo1FileId, photo2FileId,open_id){
//   console.log("pxlollllplllll")
//   my.zphoto.callFunction({
//     name: 'photo_database', 
//     data: {
     
//       photo1FileId: photo1FileId,
//       photo2FileId: photo2FileId,
//       photo_type: getApp().globalData.type,
//       open_id: open_id
//     },
//     success: (res) => {
//       console.log('上传成功:', res);
//     },
//     fail: (err) => {
//       console.error('调用云函数失败:', err);
//     }
//   });
  
// }


async upload_database(photo1FileId, photo2FileId, open_id, order_number) {
  const db = my.zphoto.database(); // 确保数据库对象已正确初始化
  // const uploadTime = this.formatDateTime()
  const uploadTime =  this.formatDateTime()


  console.log("看看这个测试"+uploadTime)


  
  try {
    const status = getApp().globalData.type.includes("回执") ? "回执认证中" : "订单完成";
  
    const result = await db.collection('user_photo').add({
      data: {
        uploadTime: uploadTime,
        photo1FileId: photo1FileId,
        photo2FileId: photo2FileId,
        photo_type: getApp().globalData.type,
        open_id: open_id,
        order_number: order_number,
        status: status // 根据条件设置 status 字段
      }
    });
  
    return {
      success: true,
      data: result
    };
  
  } catch (error) {
    console.error('Database error:', error);
  
    return {
      success: false,
      errorMessage: error.message || 'Database operation failed'
    };
  }


 
},
//用来模拟一个订单号
generateOrderNumber() {
  return Math.floor(Math.random() * 900000) + 100000;
},

 
formatDateTime() {
  const date = new Date();
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}




});
