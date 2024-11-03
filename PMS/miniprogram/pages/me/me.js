Page({
  onJumpToPage() {
    // 跳转到指定页面
    my.navigateTo({
      url: '/pages/targetPage/targetPage'
    });
  },
 
  onJumpToOrders() {
    my.switchTab({ 
      url: '/pages/order/order', 
    }); 
  },
 
  onJumpToCustomerService() {
    my.navigateTo({
      url: '/pages/customerService/customerService'
    });
  },
 
  onJumpToNotes() {
    my.navigateTo({
      url: '/pages/notes/notes'
    });
  },
 
  onJumpToStrategy() {
    my.navigateTo({
      url: '/pages/strategy/strategy'
    });
  },
 
  onShareToFriends() {
    // 调用分享接口
    my.share({
      title: '分享给朋友',
      content: '这是一个非常有用的内容，快来看看吧！',
      path: '/pages/index/index',
      imageUrl: 'https://example.com/image.png',
      success: (res) => {
        my.showToast({
          type: 'success',
          content: '分享成功'
        });
      },
      fail: (err) => {
        my.showToast({
          type: 'fail',
          content: '分享失败'
        });
      }
    });
  },
  jump_more(e){
    my.navigateTo({
        url:'/pages/more/more'
    })
  },
 });