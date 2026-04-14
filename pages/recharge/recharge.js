Page({
  data: {
    exchangeRateText: '充值汇率：1元 = 10创作点数',
    plans: [
      {
        id: 2,
        name: '9.9元 试水包',
        price: 9.9,
        points: 100,
        desc: '约 3 次生成'
      },
      {
        id: 3,
        name: '29.9元 测图包',
        price: 29.9,
        points: 330,
        desc: '含赠送 31 点'
      },
      {
        id: 4,
        name: '69.9元 畅享包',
        price: 69.9,
        points: 850,
        desc: '含赠送 151 点'
      }
    ],
    selectedPlanId: 2,
    remainingCredits: 0,
    highModalVisible: false,
    pendingHighPlanId: null
  },

  onLoad() {
    this.syncCredits();
  },

  onShow() {
    this.syncCredits();
  },

  syncCredits() {
    const credits = wx.getStorageSync('remainingCredits');
    if (credits !== undefined) {
      this.setData({ remainingCredits: credits });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onSelectPlan(e) {
    const rawId = e.currentTarget.dataset.id;
    const id = Number(rawId);
    if (!id) return;
    this.setData({ selectedPlanId: id });
  },

  onTapRechargeNow() {
    const selectedId = Number(this.data.selectedPlanId);
    const plan = this.data.plans.find((p) => Number(p.id) === selectedId);
    if (!plan) return;

    // 9.9 套餐：先确认支付
    if (plan.id === 2) {
      wx.showModal({
        title: '确认支付',
        content: `确认支付 ¥${plan.price}，购买 ${plan.points} 创作点数吗？`,
        confirmText: '确认支付',
        cancelText: '再想想',
        success: (res) => {
          if (!res.confirm) return;
          this.applyRecharge(plan);
        }
      });
      return;
    }

    // 29.9 / 69.9 套餐：展示自定义弹窗（支持长按钮文案）
    this.setData({
      highModalVisible: true,
      pendingHighPlanId: plan.id
    });
  },

  closeHighModal() {
    this.setData({ highModalVisible: false, pendingHighPlanId: null });
  },

  noop() {},

  onHighPlanDirectPay() {
    const plan = this.data.plans.find((p) => p.id === this.data.pendingHighPlanId);
    this.closeHighModal();
    if (!plan) return;
    this.applyRecharge(plan);
  },

  onHighPlanGuidePay() {
    const plan = this.data.plans.find((p) => p.id === this.data.pendingHighPlanId);
    this.closeHighModal();
    if (!plan) return;
    this.payAfterGuide(plan);
  },

  payAfterGuide(plan) {
    wx.showModal({
      title: '《30秒出片避雷指南》',
      content:
        '1）先用练手额度跑低风险图；\n2）标题与场景词要清晰；\n3）先测 2-3 套风格再批量放大。\n\n已为本单附赠 2 次练手额度。',
      confirmText: '我已了解，去支付',
      cancelText: '稍后再说',
      success: (res) => {
        if (!res.confirm) return;
        this.applyRecharge(plan);
      }
    });
  },

  applyRecharge(plan) {
    const current = Number(wx.getStorageSync('remainingCredits') || 0);
    const next = current + Number(plan.points || 0);
    wx.setStorageSync('remainingCredits', next);
    this.setData({ remainingCredits: next });

    // 29.9 / 69.9 额外赠送练手额度（不计入套餐点数）
    if (plan.id === 3 || plan.id === 4) {
      const practice = Number(wx.getStorageSync('bonusPracticeQuota') || 0) + 2;
      wx.setStorageSync('bonusPracticeQuota', practice);
    }

    wx.showToast({
      title: `支付成功，+${plan.points}点`,
      icon: 'success'
    });
  }
});
