App({
  globalData: {
    color:null,
    size:null,
    authCode:null,
    money:null,
    photo1:null,//photo1为接口调用后返回来的图片
    photo2:null,//photo2为被画布处理后的图片
    type:null,
    safe:null,
    color:null,
    
  
  },

  async onLaunch(options) {

    // const userInfo = my.getStorageSync({ key: 'userInfo' }).data;
    
    // if (userInfo) {
    //   console.log('会员信息已存在:', userInfo);
    //   // 不需要再次请求
    // } else {
      // 如果没有会员信息，发起授权请求
      this.getAuthCode();
    // }


    
    // 创建 Cloud 实例
    const cloud = my.cloud.createCloudContext({
      env: 'env-00jxh5z6m43y' 
    });

    // 初始化 Cloud 实例
    await cloud.init();
    
    my.zphoto = cloud;
  },

  onShow(options) {
 
  },


  getAuthCode() {
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        const authCode = res.authCode;
        getApp().globalData.authCode = authCode;
        console.log("获取到的authCode: ", getApp().globalData.authCode);
        this.getUserInfo(authCode); 
  
      },
      fail: (err) => {
        console.error("获取authCode失败: ", err);
      }
    });
  },
  
  
  
});
