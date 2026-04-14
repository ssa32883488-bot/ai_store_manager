const REFERENCE_STYLE_POOL = require('../../utils/reference-style-images.js');
const { normalizeUserInfo, LOCAL_AVATAR } = require('../../utils/user-info.js');

function shufflePick(list, n) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr.slice(0, n);
}

Page({
  redirectingToLogin: false,
  data: {
    defaultAvatarUrl: LOCAL_AVATAR,
    bannerList: [
      '/images/banners/home-banner-1.png',
      '/images/banners/home-banner-2.png',
      '/images/banners/home-banner-3.png'
    ],
    // 用户信息
    userInfo: {
      avatarUrl: '',
      nickname: '小店长老板娘'
    },
    // 当前模式：simple 极简 / pro 专业
    currentMode: 'simple',
    remainingCredits: 0,
    inspirationListLeft: [],
    inspirationListRight: []
  },

  onLoad(options) {
    console.log('首页加载', options);
    this.checkLogin();
    this.loadUserInfo();
    this.refreshInspirationCards();
  },

  onShow() {
    this.checkLogin();
    this.loadUserInfo();
    this.handleWelcomeGift();
    this.updateTabBarActive();
  },

  handleWelcomeGift() {
    const hasGifted = wx.getStorageSync('welcomeGiftGranted');
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn || hasGifted) return;

    const currentCredits = Number(wx.getStorageSync('remainingCredits') || 0);
    const nextCredits = currentCredits + 30;
    wx.setStorageSync('remainingCredits', nextCredits);
    wx.setStorageSync('welcomeGiftGranted', true);
    this.setData({ remainingCredits: nextCredits });

    wx.showModal({
      title: '🎁 新手见面礼已到账',
      content: '恭喜你获得 30 创作点数，已自动发放到账号，可立即开始创作。',
      showCancel: false,
      confirmText: '立即体验'
    });
  },

  updateTabBarActive() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 0 });
    }
  },

  /** 从美食 / 鞋服 / 生活用品参考图中随机 4 张填入灵感橱窗 */
  refreshInspirationCards() {
    const four = shufflePick(REFERENCE_STYLE_POOL, 4);
    this.setData({
      inspirationListLeft: [four[0], four[2]],
      inspirationListRight: [four[1], four[3]]
    });
  },

  // 检查登录状态
  checkLogin() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (isLoggedIn || this.redirectingToLogin) return;
    this.redirectingToLogin = true;
    wx.reLaunch({
      url: '/pages/login/login',
      complete: () => {
        // 释放节流锁，避免连续生命周期里重复触发导致 timeout
        setTimeout(() => {
          this.redirectingToLogin = false;
        }, 300);
      }
    });
  },

  onReady() {
    console.log('首页就绪');
  },

  onHide() {
    console.log('首页隐藏');
  },

  onUnload() {
    console.log('首页卸载');
  },

  onPullDownRefresh() {
    this.refreshInspirationCards();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 400);
  },

  onReachBottom() {
    console.log('触底加载更多');
  },

  // 加载用户信息
  loadUserInfo() {
    const raw = wx.getStorageSync('userInfo');
    const credits = wx.getStorageSync('remainingCredits');
    if (raw) {
      this.setData({ userInfo: normalizeUserInfo(raw) });
    }
    if (credits !== undefined) {
      this.setData({ remainingCredits: credits });
    }
  },

  // 切换模式（默认极简；专业模式仅提示开发中，不跳转）
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode === 'pro') {
      wx.showModal({
        title: '提示',
        content: '专业模式正在开发中，敬请期待',
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }
    this.setData({ currentMode: 'simple' });
  },

  // 点击用户信息
  onTapProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  // 点击横幅
  onTapBanner() {
    wx.showToast({
      title: '教程视频即将上线',
      icon: 'none'
    });
  },

  // 点击开始制作
  onTapStartCreate() {
    const url = this.data.currentMode === 'simple' 
      ? '/pages/simple-create/simple-create'
      : '/pages/pro-create/pro-create';
    
    wx.navigateTo({ url });
  },

  // 查看更多灵感
  onViewMore() {
    wx.showToast({
      title: '更多灵感即将上线',
      icon: 'none'
    });
  },

  // 点击卡片
  onTapCard(e) {
    const id = e.currentTarget.dataset.id;
    const list = [...this.data.inspirationListLeft, ...this.data.inspirationListRight];
    const current = list.find((item) => item.id === id);
    const urls = list.map((item) => item.imageUrl);
    if (!current || !current.imageUrl) return;
    wx.previewImage({
      current: current.imageUrl,
      urls
    });
  },

  // 做同款：保存参考图路径并引导去开始制作
  onTapCreateSame(e) {
    const id = e.currentTarget.dataset.id;
    const list = [...this.data.inspirationListLeft, ...this.data.inspirationListRight];
    const current = list.find((item) => item.id === id);
    if (!current || !current.imageUrl) return;

    wx.setStorageSync('sameStyleImagePath', current.imageUrl);
    wx.showModal({
      title: '提示',
      content: '图片已保存到本地，用户可以点击“开始制作”复刻同款！',
      cancelText: '一会再去',
      confirmText: '现在开始',
      success: (res) => {
        if (!res.confirm) return;
        wx.navigateTo({
          url: '/pages/simple-create/simple-create'
        });
      }
    });
  }
});
