Page({
    data: {
      isAgreed: false,
      loginHeroUrl: '/images/login/login.png'
    },
  
    onLoad() {
      console.log('登录页加载');
    },

    onHeroError() {
      if (this.data.loginHeroUrl !== '/images/login/login-hero.png') {
        this.setData({ loginHeroUrl: '/images/login/login-hero.png' });
      } else {
        wx.showToast({
          title: '登录图加载失败',
          icon: 'none'
        });
      }
    },
  
    // Vant Checkbox 切换事件
    toggleAgreement(event) {
      this.setData({ 
        isAgreed: event.detail 
      });
      console.log('协议状态:', event.detail);
    },
  
    // Vant Button 点击事件
    onWechatLogin() {
      if (!this.data.isAgreed) {
        wx.showToast({ 
          title: '请先同意用户协议', 
          icon: 'none' 
        });
        return;
      }
  
      wx.showLoading({ 
        title: '登录中...', 
        mask: true 
      });
  
      setTimeout(() => {
        wx.hideLoading();
        
        const userInfo = {
          avatarUrl: '/images/profile/avatar.png',
          nickname: '小店长老板娘'
        };
        
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('isLoggedIn', true);
        
        wx.showToast({ 
          title: '登录成功', 
          icon: 'success' 
        });
        
        setTimeout(() => {
          wx.switchTab({ 
            url: '/pages/home/home' 
          });
        }, 800);
      }, 800);
    },
  
    viewUserAgreement() {
      wx.showModal({
        title: '用户服务协议',
        content: '本协议是您与AI小店长之间关于使用本小程序服务的协议...',
        showCancel: false
      });
    },
  
    viewPrivacyPolicy() {
      wx.showModal({
        title: '隐私政策',
        content: 'AI小店长尊重并保护所有使用服务用户的个人隐私权...',
        showCancel: false
      });
    }
  });