App({
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },

  onLaunch(options) {
    console.log('App Launch', options);
    // 检查登录状态，决定启动页面
    this.checkLoginAndRedirect();
  },

  onShow(options) {
    console.log('App Show', options);
  },

  onHide() {
    console.log('App Hide');
  },

  onError(msg) {
    console.error('App Error:', msg);
  },

  onPageNotFound(res) {
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },

  // 检查登录状态并跳转
  checkLoginAndRedirect() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    const userInfo = wx.getStorageSync('userInfo');
    
    this.globalData.isLoggedIn = isLoggedIn;
    this.globalData.userInfo = userInfo;
    
    console.log('登录状态:', isLoggedIn ? '已登录' : '未登录');
  }
});
