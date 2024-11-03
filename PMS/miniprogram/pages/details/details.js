Page({
  data: {},
  onLoad(options) {

    
    const photo2Path = decodeURIComponent(options.photo2Path); // 获取传递的 photo2 路径
    let fileID = decodeURIComponent(options.fileID); // 获取传递的 fileID

    // 替换 fileID 中的 photo2.jpg 为 photo3.jpg
    fileID = fileID.replace('photo2.jpg', 'photo3.jpg');
    

    console.log("更新后的 fileID:", fileID);
    this.setData({
      photo2Path: photo2Path
    })

    
  },


  async downloadPhoto(fileID) {
    console.log("这是fileID:", fileID);
    const randomSuffix = Math.floor(Math.random() * 10000); // 生成一个随机数作为后缀
    const userPath = `${my.env.USER_DATA_PATH}/img_${randomSuffix}.jpg`; // 使用随机后缀生成文件名

    try {
        const res = await my.zphoto.downloadFile({ fileID, filePath: userPath }); // 下载时指定路径

        if (res.statusCode === 200) {
            console.log("下载成功，文件路径:", userPath); // 输出指定的文件路径
            return userPath; // 返回指定的文件路径
        } else {
            console.error("下载失败，状态码:", res.statusCode);
            return null;
        }
    } catch (error) {
        console.error("下载照片失败:", error);
        return null;
    }
},
  
});
