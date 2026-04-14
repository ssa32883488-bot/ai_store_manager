Page({
  data: {
    platformId: 1,
    platformName: '',
    imageUrl: '',
    showTitles: false,
    titleOptions: [],
    copyOptions: [],
    selectedTitleId: null,
    selectedCopyId: null,
    empty: false
  },

  onLoad() {
    const raw = wx.getStorageSync('lastCreateResult');
    if (!raw || !raw.imageUrl) {
      this.setData({ empty: true });
      return;
    }
    const showTitles = raw.platformId === 2 || raw.platformId === 3;
    const titleOpts = raw.titleOptions || [];
    const copyOpts = raw.copyOptions || [];
    this.setData({
      platformId: raw.platformId,
      platformName: raw.platformName || '',
      imageUrl: raw.imageUrl,
      showTitles,
      titleOptions: titleOpts,
      copyOptions: copyOpts,
      selectedTitleId: showTitles && titleOpts[0] ? titleOpts[0].id : null,
      selectedCopyId: copyOpts[0] ? copyOpts[0].id : null,
      empty: false
    });
  },

  selectTitle(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedTitleId: id });
  },

  selectCopy(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedCopyId: id });
  },

  getSelectedTitleText() {
    const { titleOptions, selectedTitleId } = this.data;
    const item = titleOptions.find((t) => t.id === selectedTitleId);
    return item ? item.text : '';
  },

  getSelectedCopyText() {
    const { copyOptions, selectedCopyId } = this.data;
    const item = copyOptions.find((c) => c.id === selectedCopyId);
    return item ? item.text : '';
  },

  onCopyTitle() {
    const text = this.getSelectedTitleText();
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '标题已复制', icon: 'success' })
    });
  },

  onCopyBody() {
    const text = this.getSelectedCopyText();
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '文案已复制', icon: 'success' })
    });
  },

  onCopyAll() {
    const { showTitles } = this.data;
    const body = this.getSelectedCopyText();
    let text = body;
    if (showTitles) {
      const title = this.getSelectedTitleText();
      text = `${title}\n\n${body}`;
    }
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制全文', icon: 'success' })
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' });
  }
});
