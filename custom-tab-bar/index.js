Component({
  data: {
    active: 0
  },
  
  lifetimes: {
    attached() {
      // 获取当前页面路径，设置高亮
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        const route = currentPage.route;
        
        if (route === 'pages/home/home') {
          this.setData({ active: 0 });
        } else if (route === 'pages/profile/profile') {
          this.setData({ active: 1 });
        }
      }
    }
  },
  
  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset;
      
      // 设置高亮
      this.setData({ active: index });
      
      // 切换页面
      wx.switchTab({
        url: '/' + path
      });
    }
  }
});