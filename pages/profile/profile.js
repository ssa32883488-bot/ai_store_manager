const { normalizeUserInfo, LOCAL_AVATAR } = require('../../utils/user-info.js');

Page({
  redirectingToLogin: false,
  data: {
    defaultAvatarUrl: LOCAL_AVATAR,
    // 用户信息
    userInfo: {
      avatarUrl: '',
      nickname: '小店长老板娘'
    },
    // 剩余次数
    remainingCredits: 28
  },

  onLoad(options) {
    console.log('个人主页加载', options);
    // 检查登录状态
    this.checkLogin();
    this.loadUserInfo();
  },

  onShow() {
    console.log('个人主页显示');
    // 检查登录状态
    this.checkLogin();
    // 每次显示时刷新数据
    this.loadUserInfo();
    this.updateTabBarActive();
  },

  updateTabBarActive() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 1 });
    }
  },

  // 检查登录状态
  checkLogin() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (isLoggedIn || this.redirectingToLogin) return;
    this.redirectingToLogin = true;
    wx.reLaunch({
      url: '/pages/login/login',
      complete: () => {
        setTimeout(() => {
          this.redirectingToLogin = false;
        }, 300);
      }
    });
  },

  onReady() {
    console.log('个人主页就绪');
  },

  onHide() {
    console.log('个人主页隐藏');
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo: normalizeUserInfo(userInfo) });
    }
    
    // 加载剩余次数
    const credits = wx.getStorageSync('remainingCredits');
    if (credits !== undefined) {
      this.setData({ remainingCredits: credits });
    }
  },

  // 点击设置
  onTapSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  },

  // 我的作品
  onTapMyWorks() {
    wx.navigateTo({
      url: '/pages/works/works'
    });
  },

  // 我的草稿
  onTapMyDrafts() {
    wx.navigateTo({
      url: '/pages/drafts/drafts'
    });
  },

  // 充值中心
  onTapRecharge() {
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    });
  },

  // 帮助与教程
  onTapHelp() {
    wx.showModal({
      title: '帮助中心',
      content: '如有问题，请联系客服',
      showCancel: false
    });
  },

  // 联系客服
  onTapContact() {
    // 企业微信客服参数未配置时，避免触发 openCustomerServiceChat timeout
    const corpId = '';
    const customerUrl = '';
    if (!corpId || !customerUrl) {
      wx.showToast({
        title: '客服通道暂未配置',
        icon: 'none'
      });
      return;
    }

    wx.openCustomerServiceChat({
      extInfo: { url: customerUrl },
      corpId,
      fail: (err) => {
        console.warn('打开客服会话失败', err);
        wx.showToast({
          title: '联系客服失败，请稍后再试',
          icon: 'none'
        });
      }
    });
  },

  // 关于我们
  onTapAbout() {
    wx.showModal({
      title: '关于 AI小店长',
      content: 'AI小店长是一款专为小店主打造的AI营销工具，帮助您轻松制作爆款图文内容。\n\n版本: 1.0.0',
      showCancel: false
    });
  },

  // 切换账号
  onSwitchAccount() {
    wx.showModal({
      title: '提示',
      content: '确定要切换账号吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('isLoggedIn');
          
          // 获取应用实例并更新全局数据
          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.isLoggedIn = false;
          
          // 跳转到登录页
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  }
});
