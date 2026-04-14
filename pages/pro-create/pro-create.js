Page({
  data: {
    // 上传的图片
    uploadedImage: '',
    // 平台选项
    platforms: [
      { id: 1, name: '朋友圈' },
      { id: 2, name: '小红书' },
      { id: 3, name: '抖音' }
    ],
    // 选中的平台
    selectedPlatform: 1,
    // 自定义提示词
    customPrompt: '',
    // 重绘幅度滑块值 0-100
    redrawSlider: 65,
    // 重绘幅度显示值 0-1
    redrawValue: '0.65',
    // 风格强度滑块值 0-100
    styleStrengthSlider: 82,
    // 风格强度显示值 0-1
    styleStrengthValue: '0.82',
    // 是否可以生成
    canGenerate: false
  },

  onLoad(options) {
    console.log('专业制作页加载', options);
    this.checkLogin();
    this.updateCanGenerate();
  },

  onShow() {
    console.log('专业制作页显示');
    this.checkLogin();
  },

  // 检查登录状态
  checkLogin() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn) {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }
  },

  // 返回
  onBack() {
    wx.navigateBack();
  },

  // 选择图片
  onChooseImage() {
    if (this.data.uploadedImage) {
      return; // 已有图片时不触发选择
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          uploadedImage: res.tempFiles[0].tempFilePath
        });
        this.updateCanGenerate();
      }
    });
  },

  // 删除图片
  onDeleteImage(e) {
    e.stopPropagation();
    this.setData({
      uploadedImage: ''
    });
    this.updateCanGenerate();
  },

  // 选择平台
  selectPlatform(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    this.setData({
      selectedPlatform: id
    });
  },

  // 提示词输入
  onPromptInput(e) {
    this.setData({
      customPrompt: e.detail.value
    });
  },

  // 重绘幅度变化
  onRedrawChange(e) {
    const value = e.detail.value;
    this.setData({
      redrawSlider: value,
      redrawValue: (value / 100).toFixed(2)
    });
  },

  // 风格强度变化
  onStyleStrengthChange(e) {
    const value = e.detail.value;
    this.setData({
      styleStrengthSlider: value,
      styleStrengthValue: (value / 100).toFixed(2)
    });
  },

  // 更新生成按钮状态
  updateCanGenerate() {
    const canGenerate = !!this.data.uploadedImage;
    this.setData({ canGenerate });
  },

  // 开始生成
  startGenerate() {
    if (!this.data.canGenerate) {
      wx.showToast({
        title: '请先上传图片',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: 'AI制作中...',
      mask: true
    });

    // 模拟AI生成过程
    const params = {
      image: this.data.uploadedImage,
      platform: this.data.platforms.find(p => p.id === this.data.selectedPlatform).name,
      customPrompt: this.data.customPrompt,
      redrawValue: this.data.redrawValue,
      styleStrengthValue: this.data.styleStrengthValue
    };

    console.log('生成参数:', params);

    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '生成成功！',
        icon: 'success'
      });

      // 返回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/home'
        });
      }, 1000);
    }, 3000);
  }
});
