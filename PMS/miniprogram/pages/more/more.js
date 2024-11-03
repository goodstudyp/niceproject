Page({
  data: {
    activeTab: 'all', // 当前激活的 tab
    search: '', // 搜索框输入值
    allOptions: [

      { type: '自定义证件照', mm: '', category: 'common' } ,
      { type: '更改照片背景颜色', mm: '', category: 'common' } ,
      { type: '港澳通行证回执', mm: '33mm×48mm|480x640px', category: 'life' },
      { type: '驾驶证回执', mm: '22mm×32mm|260x378px', category: 'work' },
      { type: '社保证回执', mm: '26mm×32mm|358x441px', category: 'work' },
      { type: '身份证回执', mm: '26mm×32mm|358x441px', category: 'work' },
      { type: '居住证回执', mm: '26mm×32mm|358x441px', category: 'work' },
      { type: '一寸证件照', mm: '25mm×35mm|295x413px', category: 'common' },
      { type: '二寸证件照', mm: '35mm×53mm|413x626px', category: 'common' },
      { type: '小一寸证件照', mm: '22mm×32mm|260x378px', category: 'common', },
      { type: '护照照片', mm: '33mm×48mm|390x567px', category: 'life' },
     
     
     
    ],
    filteredOptions: [] // 根据当前 tab 过滤的选项
  },

  onLoad() {
    this.filterOptions(); // 页面加载时显示全部选项
  },

  // 切换选项卡
  changeTab(e) {
    const selectedTab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: selectedTab
    });
    this.filterOptions();
  },

  // 根据 tab 筛选选项
  filterOptions() {
    const activeTab = this.data.activeTab;
    const allOptions = this.data.allOptions;
    let filtered;

    if (activeTab === 'all') {
      filtered = allOptions;
    } else {
      filtered = allOptions.filter(item => item.category === activeTab);
    }

    this.setData({ filteredOptions: filtered });
  },

  // 搜索功能
  handleSearch(e) {
    const searchValue = e.detail.value.toLowerCase();
    this.setData({ search: searchValue });

    const allOptions = this.data.allOptions;
    const filtered = allOptions.filter(item => item.type.toLowerCase().includes(searchValue));

    this.setData({ filteredOptions: filtered });
  },

  // 选择证件照，设置全局变量
  handleTap(e) {
    const type = e.currentTarget.dataset.type;
    const mm = e.currentTarget.dataset.mm;
  
    if (type === '自定义证件照') {
      // 弹出操作表，让用户选择输入像素尺寸还是毫米尺寸
      getApp().globalData.type = type;
      my.navigateTo({
        url: `/pages/costomize/costomize`
      });
    } else {
      // 其他选项处理
      const [mmValue, pxValue] = mm.split('|');
      const cleanPxValue = pxValue.replace('px', '');
      const [width, height] = cleanPxValue.split('x').map(Number);
  
      // 设置全局变量
      getApp().globalData.size = { width, height };
      getApp().globalData.type = type;
  
      // 跳转页面并传递尺寸值
      my.navigateTo({
        url: `/pages/idCard/idCard?sizedemo=${mmValue}`
      });
    }
  },

});
