Page({
  data:{
    data:null,
     message:' 24小时人工客服: 13215261127 ',
    
    
  },
  handleTap(e) {
    var myUrl;
    const brief = e.currentTarget.dataset.brief;
    const color = e.currentTarget.dataset.color;
    const money = e.currentTarget.dataset.money;
    const type = e.currentTarget.dataset.type;
    const sizedemo = e.currentTarget.dataset.sizedemo;
    getApp().globalData.color = color;
    getApp().globalData.money = money;
    getApp().globalData.type = type;
    

   
    
    const [width, height] = brief.split('x').map(Number); 
    getApp().globalData.size = {
      width: width,   
      height: height  
    };
  
   
    console.log(getApp().globalData.size);


   
        myUrl = '/pages/idCard/idCard' ;
   

  
  
        my.navigateTo({
            url: `${myUrl}?sizedemo=${sizedemo}`
          });
},

catchTap(e) {
    my.alert({
        title: 'catchTap',
        content: e.currentTarget.dataset.info,
    });
    console.log(e);
},

handleSetRadius(checked) {
    this.setData({
        radius: checked,
    });
},


  catchTap(e) {
      my.alert({
          title: 'catchTap',
          content: e.currentTarget.dataset.info,
      });
      console.log(e);
  },
  handleSetRadius(checked) {
      this.setData({
          radius: checked,
      });
  },
  jump_more(e){
    my.navigateTo({
        url:'/pages/details/details'
    })
  },
  goToMore: function() {
    my.navigateTo({
      url: '/pages/more/more'
    });
  },




   onLanuch(){
   
  }
})