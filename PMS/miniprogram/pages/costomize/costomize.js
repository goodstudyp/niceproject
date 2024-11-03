Page({
  data: {
    SizeType: 'pixel', // 默认选择像素尺寸
    width: '',
    height: '',
    size_cy: null
  },
  
  radioChange: function(e) {
    this.setData({
      SizeType: e.detail.value
    });
  },
  
  handleWidthInput: function(e) {
    this.setData({
      width: e.detail.value
    });
  },
  
  handleHeightInput: function(e) {
    this.setData({
      height: e.detail.value
    });
  },
  
  submitSize: function() {
    const { SizeType, width, height } = this.data;

    // 输入验证
    if (!width || !height || isNaN(width) || isNaN(height)) {
      my.showToast({
        type: 'fail',
        content: '请输入有效的宽度和高度'
      });
      return;
    }
    
    let size_cy;
    if (SizeType === 'pixel') {
      size_cy = this.convertPixelToPrint(width, height);
      getApp().globalData.size = { width: parseInt(width), height: parseInt(height) };
    } else if (SizeType === 'print') {
      const size = this.convertPrintToPixel(width, height);
      size_cy = `${size.width}px×${size.height}px`; // 直接生成像素尺寸字符串
      getApp().globalData.size = { width: size.width, height: size.height };
    }
    
    this.setData({
      size_cy: size_cy
    });
    
    my.showToast({
      type: 'success',
      content: '尺寸设置成功'
    });
    
    // 跳转到新页面，并传递 sizedemo 参数
    my.navigateTo({
      url: `/pages/idCard/idCard?sizedemo=${size_cy}`
    });
  },
  
  convertPixelToPrint: function(width, height) {
    const dpi = 300; // 300 DPI
    const widthMM = Math.round((width / dpi) * 25.4);
    const heightMM = Math.round((height / dpi) * 25.4);
    return `${widthMM}mm×${heightMM}mm`;
  },
  
  convertPrintToPixel: function(width, height) {
    const dpi = 300; // 300 DPI
    const widthPX = Math.round((width / 25.4) * dpi);
    const heightPX = Math.round((height / 25.4) * dpi);
    return { width: widthPX, height: heightPX }; // 返回对象
  }
});
