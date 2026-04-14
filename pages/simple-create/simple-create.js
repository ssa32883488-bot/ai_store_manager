const CozeSdk = require('../../cozeSDK/index');
const CozeConfig = require('../../cozeSDK/config');
const { toAssetUrl, resolveAssetUrls } = require('../../utils/asset-config');

Page({
  data: {
    totalSteps: 5,
    // 当前步骤
    currentStep: 1,
    // 第一步：发布渠道图标（images/minimal-flow/，见 images/README.md）
    publishChannels: [
      { id: 1, name: '朋友圈/私域', iconPath: '/images/minimal-flow/channel-wechat.png' },
      { id: 2, name: '小红薯', iconPath: '/images/minimal-flow/channel-xhs.png' },
      { id: 3, name: 'dou音', iconPath: '/images/minimal-flow/channel-douyin.png' },
      { id: 4, name: '电商主图', iconPath: '/images/minimal-flow/channel-ecom.png' }
    ],
    selectedPublishChannel: 1,
    // 产品输入
    productInput: '',
    // 上传的产品原图（步骤2）
    uploadedImage: '',
    uploadedImageUrl: '',
    // 第三步：品类（美食/鞋服/生活用品）→ 参考风格；可与自定义参考图二选一
    referenceImage: '',
    referenceImageUrl: '',
    referenceStyleCategories: [
      {
        id: 1,
        name: '美食',
        styles: [
          { id: 101, name: '极简留白', imageUrl: '/images/reference-styles/美食/极简留白.jpg' },
          { id: 102, name: '美食特写', imageUrl: '/images/reference-styles/美食/美食特写.jpg' },
          { id: 103, name: '带手入镜', imageUrl: '/images/reference-styles/美食/带手入镜.jpg' },
          { id: 104, name: '服饰平铺', imageUrl: '/images/reference-styles/美食/服饰平铺.jpg' },
          { id: 105, name: '45度微距', imageUrl: '/images/reference-styles/美食/45度微距.jpg' }
        ]
      },
      {
        id: 2,
        name: '鞋服',
        styles: [
          { id: 201, name: '极简平铺', imageUrl: '/images/reference-styles/鞋服/极简平铺.jpg' },
          { id: 202, name: '极简折叠', imageUrl: '/images/reference-styles/鞋服/极简折叠.jpg' },
          { id: 203, name: '局部细节特写', imageUrl: '/images/reference-styles/鞋服/局部细节特写.jpg' },
          { id: 204, name: '氛围感挂拍', imageUrl: '/images/reference-styles/鞋服/氛围感挂拍.jpg' },
          { id: 205, name: '场景化摆拍', imageUrl: '/images/reference-styles/鞋服/场景化摆拍.jpg' },
          { id: 206, name: '模特上身', imageUrl: '/images/reference-styles/鞋服/模特上身.jpg' },
          { id: 207, name: '光影塑形', imageUrl: '/images/reference-styles/鞋服/光影塑形.jpg' },
          { id: 208, name: '鞋子俯视', imageUrl: '/images/reference-styles/鞋服/鞋子俯视.jpg' },
          { id: 209, name: '鞋子侧视', imageUrl: '/images/reference-styles/鞋服/鞋子侧视.jpg' },
          { id: 210, name: '鞋子细节特写', imageUrl: '/images/reference-styles/鞋服/鞋子细节特写.jpg' },
          { id: 211, name: '鞋子氛围感', imageUrl: '/images/reference-styles/鞋服/鞋子氛围感.jpg' },
          { id: 212, name: '上脚动态特写', imageUrl: '/images/reference-styles/鞋服/上脚动态特写.jpg' }
        ]
      },
      {
        id: 3,
        name: '生活用品',
        styles: [
          { id: 301, name: '极简居中', imageUrl: '/images/reference-styles/生活用品/极简居中.jpg' },
          { id: 302, name: '生活场景融入', imageUrl: '/images/reference-styles/生活用品/生活场景融入.jpg' },
          { id: 303, name: '几何矩阵排列', imageUrl: '/images/reference-styles/生活用品/几何矩阵排列.jpg' },
          { id: 304, name: '高低错落层次摆拍', imageUrl: '/images/reference-styles/生活用品/高低错落层次摆拍.jpg' },
          { id: 305, name: '数码产品科技感', imageUrl: '/images/reference-styles/生活用品/数码产品科技感.jpg' },
          { id: 306, name: '手持产品特写', imageUrl: '/images/reference-styles/生活用品/手持产品特写.jpg' }
        ]
      }
    ],
    selectedRefCategory: 1,
    selectedReferenceStyleId: 101,
    refInputMode: 'preset',
    // 第四步：朋友圈/小红薯/dou音 补充说明；电商无此项
    supplementText: '',
    // 第四步：文案风格（朋友圈 / 小红薯 / dou音）
    copywritingStyleOptions: [
      { id: 1, name: '清仓捡漏' },
      { id: 2, name: '限时秒杀' },
      { id: 3, name: '粉丝专属' },
      { id: 4, name: '老板日常' },
      { id: 5, name: '源头工厂' },
      { id: 6, name: '专业测评' },
      { id: 7, name: '红薯种草' },
      { id: 8, name: '痛点暴击' },
      { id: 9, name: '幽默整活' }
    ],
    selectedCopywritingStyle: 2,
    // 第四步：电商主图 — 平台与标题风格
    ecomPlatformOptions: [
      { id: 1, name: '淘宝' },
      { id: 2, name: '京东' },
      { id: 3, name: '拼多多' },
      { id: 4, name: '抖音商城' },
      { id: 5, name: '其他' }
    ],
    selectedEcomPlatform: 1,
    titleStyleOptions: [
      { id: 1, name: '吸睛促销风' },
      { id: 2, name: '写实说明风' },
      { id: 3, name: '场景故事风' },
      { id: 4, name: '极简关键词' }
    ],
    selectedTitleStyle: 1,
    // 路由参数
    templateId: null,

    // 第五步：生成中 / 结果（承接动画占位与接口返回）
    generating: false,
    resultReady: false,
    /** 过渡文案，可改；后续可配合 Lottie 一起换行展示 */
    generatingHintText: '正在为你生成图片与文案，请稍候…',
    resultImageUrl: '',
    resultPlatformName: '',
    resultImageOnly: false,
    resultShowTitles: false,
    resultTitleOptions: [],
    resultCopyOptions: [],
    resultSelectedTitleId: null,
    resultSelectedCopyId: null
  },

  onLoad(options) {
    console.log('极简制作页加载', options);
    // 检查登录状态
    this.checkLogin();
    this.hydrateStaticAssetUrls();
    this.refreshStaticAssetTempUrls();
    CozeSdk.initialize();
    this.presetStyleCloudUrlMap = {};
  },

  hydrateStaticAssetUrls() {
    const publishChannels = (this.data.publishChannels || []).map((item) => ({
      ...item,
      iconPath: toAssetUrl(item.iconPath)
    }));
    const referenceStyleCategories = (this.data.referenceStyleCategories || []).map((cat) => ({
      ...cat,
      styles: (cat.styles || []).map((style) => ({
        ...style,
        imageUrl: toAssetUrl(style.imageUrl)
      }))
    }));
    this.setData({
      publishChannels,
      referenceStyleCategories
    });
  },

  async refreshStaticAssetTempUrls() {
    const iconPaths = (this.data.publishChannels || []).map((item) => item.iconPath);
    const stylePaths = [];
    (this.data.referenceStyleCategories || []).forEach((cat) => {
      (cat.styles || []).forEach((style) => {
        stylePaths.push(style.imageUrl);
      });
    });
    const targetPaths = [...iconPaths, ...stylePaths];
    if (!targetPaths.length) return;

    const urlMap = await resolveAssetUrls(targetPaths);
    const publishChannels = (this.data.publishChannels || []).map((item) => ({
      ...item,
      iconPath: urlMap[item.iconPath] || toAssetUrl(item.iconPath)
    }));
    const referenceStyleCategories = (this.data.referenceStyleCategories || []).map((cat) => ({
      ...cat,
      styles: (cat.styles || []).map((style) => ({
        ...style,
        imageUrl: urlMap[style.imageUrl] || toAssetUrl(style.imageUrl)
      }))
    }));

    this.setData({
      publishChannels,
      referenceStyleCategories
    });
  },

  onShow() {
    console.log('极简制作页显示');
    // 检查登录状态
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
    if (this.data.currentStep === 1) {
      wx.navigateBack();
      return;
    }
    this.prevStep();
  },

  // 产品输入
  onProductInput(e) {
    this.setData({
      productInput: e.detail.value
    });
  },

  selectPublishChannel(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    const isEcom = id === 4;
    this.setData({
      selectedPublishChannel: id,
      referenceImage: '',
      referenceImageUrl: '',
      selectedRefCategory: 1,
      selectedReferenceStyleId: isEcom ? null : 101,
      refInputMode: isEcom ? 'upload' : 'preset',
      supplementText: ''
    });
  },

  selectRefInputMode(e) {
    const mode = e.currentTarget.dataset.mode;
    if (mode !== 'preset' && mode !== 'upload') return;
    if (mode === 'preset') {
      this.setData({
        refInputMode: 'preset',
        referenceImage: '',
        referenceImageUrl: ''
      });
      return;
    }
    this.setData({
      refInputMode: 'upload'
    });
  },

  onSupplementInput(e) {
    this.setData({
      supplementText: e.detail.value
    });
  },

  selectCopywritingStyle(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    this.setData({
      selectedCopywritingStyle: id
    });
  },

  selectEcomPlatform(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    this.setData({
      selectedEcomPlatform: id
    });
  },

  selectTitleStyle(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    this.setData({
      selectedTitleStyle: id
    });
  },

  // 语音输入
  onVoiceInput() {
    wx.startRecord({
      success: (res) => {
        // 录音成功，这里需要调用语音识别API
        wx.showToast({
          title: '语音识别中...',
          icon: 'loading'
        });
        
        setTimeout(() => {
          this.setData({
            productInput: '手工草莓慕斯蛋糕'
          });
          wx.hideToast();
          wx.showToast({
            title: '识别成功',
            icon: 'success'
          });
        }, 1500);
      },
      fail: () => {
        wx.showToast({
          title: '录音失败',
          icon: 'error'
        });
      }
    });
  },

  // 选择图片
  onChooseImage() {
    this.chooseAndUploadImage('original');
  },

  // 删除图片
  onDeleteImage(e) {
    e.stopPropagation();
    this.setData({
      uploadedImage: '',
      uploadedImageUrl: ''
    });
  },

  selectRefCategory(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    const cat = this.data.referenceStyleCategories.find((c) => c.id === id);
    if (!cat || !cat.styles.length) return;
    this.setData({
      selectedRefCategory: id,
      selectedReferenceStyleId: cat.styles[0].id,
      referenceImage: '',
      referenceImageUrl: ''
    });
  },

  /** 选择具体参考风格（与自定义参考图互斥） */
  selectReferenceStyle(e) {
    const id = parseInt(e.currentTarget.dataset.id, 10);
    this.setData({
      refInputMode: 'preset',
      selectedReferenceStyleId: id,
      referenceImage: '',
      referenceImageUrl: ''
    });
  },

  // 上传参考图（步骤2，优先级高于预设构图；上传后清空预设选中）
  onUploadReference() {
    this.chooseAndUploadImage('reference');
  },

  onDeleteReferenceImage(e) {
    e.stopPropagation();
    const cat = this.data.referenceStyleCategories.find(
      (c) => c.id === this.data.selectedRefCategory
    );
    const firstId = cat && cat.styles[0] ? cat.styles[0].id : 101;
    this.setData({
      referenceImage: '',
      referenceImageUrl: '',
      selectedReferenceStyleId: firstId,
      refInputMode: 'upload'
    });
  },

  async chooseAndUploadImage(type) {
    try {
      const chooseRes = await new Promise((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        });
      });
      const tempPath = chooseRes.tempFiles[0].tempFilePath;
      const url = await this.uploadImageToCloud(tempPath, type);
      wx.showModal({
        title: '图片上传成功',
        content: `图片URL:\n${url}`,
        showCancel: false,
        confirmText: '知道了'
      });

      if (type === 'original') {
        this.setData({
          uploadedImage: tempPath,
          uploadedImageUrl: url
        });
        return;
      }
      this.setData({
        refInputMode: 'upload',
        referenceImage: tempPath,
        referenceImageUrl: url,
        selectedReferenceStyleId: null
      });
    } catch (err) {
      if (err && err.errMsg && err.errMsg.includes('cancel')) return;
      wx.showToast({
        title: '图片上传失败',
        icon: 'none'
      });
    }
  },

  async uploadImageToCloud(tempFilePath, type) {
    if (!wx.cloud) {
      throw new Error('wx.cloud 不可用');
    }
    const ext = (tempFilePath.match(/\.[^.]+$/) || ['.jpg'])[0];
    const cloudPath = `uploads/${type}/${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    const uploadRes = await wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath
    });
    const getUrlRes = await wx.cloud.getTempFileURL({
      fileList: [uploadRes.fileID]
    });
    const row = getUrlRes.fileList && getUrlRes.fileList[0];
    if (!row || !row.tempFileURL) {
      throw new Error('获取云文件URL失败');
    }
    return row.tempFileURL;
  },

  // 下一步
  nextStep() {
    const { currentStep, totalSteps, selectedPublishChannel } = this.data;

    if (currentStep >= 4) {
      return;
    }

    if (currentStep === 2) {
      if (!this.data.productInput.trim() || !this.data.uploadedImageUrl) {
        wx.showToast({
          title: '请填写产品名称并上传产品原图',
          icon: 'none'
        });
        return;
      }
    }

    if (currentStep === 3) {
      const { referenceImageUrl, selectedReferenceStyleId, refInputMode } = this.data;
      if (selectedPublishChannel === 4 && !referenceImageUrl) {
        wx.showToast({
          title: '请先上传参考图',
          icon: 'none'
        });
        return;
      }
      const invalidPreset = refInputMode === 'preset' &&
        (selectedReferenceStyleId === null || selectedReferenceStyleId === undefined);
      const invalidUpload = refInputMode === 'upload' && !referenceImageUrl;
      if (invalidPreset || invalidUpload) {
        wx.showToast({
          title: refInputMode === 'upload' ? '请先上传参考图' : '请选择参考风格',
          icon: 'none'
        });
        return;
      }
    }

    const next = currentStep + 1;
    if (next <= totalSteps) {
      this.setData({
        currentStep: next
      });
    }
  },

  // 上一步
  prevStep() {
    const { currentStep } = this.data;
    if (currentStep <= 1) return;
    if (currentStep === 5) {
      this.setData({
        currentStep: 4,
        generating: false,
        resultReady: false
      });
      return;
    }
    this.setData({
      currentStep: currentStep - 1
    });
  },

  onResultSelectTitle(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ resultSelectedTitleId: id });
  },

  onResultSelectCopy(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ resultSelectedCopyId: id });
  },

  getResultTitleText() {
    const { resultTitleOptions, resultSelectedTitleId } = this.data;
    const item = resultTitleOptions.find((t) => t.id === resultSelectedTitleId);
    return item ? item.text : '';
  },

  getResultCopyText() {
    const { resultCopyOptions, resultSelectedCopyId } = this.data;
    const item = resultCopyOptions.find((c) => c.id === resultSelectedCopyId);
    return item ? item.text : '';
  },

  onResultCopyTitle() {
    const text = this.getResultTitleText();
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '标题已复制', icon: 'success' })
    });
  },

  onResultCopyBody() {
    const text = this.getResultCopyText();
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '文案已复制', icon: 'success' })
    });
  },

  onResultCopyAll() {
    const { resultShowTitles } = this.data;
    const body = this.getResultCopyText();
    let text = body;
    if (resultShowTitles) {
      const title = this.getResultTitleText();
      text = `${title}\n\n${body}`;
    }
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制全文', icon: 'success' })
    });
  },

  onResultGoHome() {
    wx.switchTab({ url: '/pages/home/home' });
  },

  /** 第一步发布渠道 → 结果页沿用的 platformId（电商主图暂与小红书同款文案结构） */
  publishChannelToResultPlatformId(channelId) {
    const map = { 1: 1, 2: 2, 3: 3, 4: 2 };
    return map[channelId] || 1;
  },

  /**
   * 组装模拟生成结果（接入真实接口后替换为接口返回）
   * 朋友圈：仅 3 条文案；小红书 / 抖音图文：7 条标题 + 3 条文案
   */
  buildMockResultPayload() {
    const {
      productInput,
      selectedRefCategory,
      referenceImage,
      referenceImageUrl,
      uploadedImageUrl,
      selectedReferenceStyleId,
      referenceStyleCategories,
      publishChannels,
      selectedPublishChannel,
      supplementText,
      copywritingStyleOptions,
      selectedCopywritingStyle,
      ecomPlatformOptions,
      selectedEcomPlatform,
      titleStyleOptions,
      selectedTitleStyle
    } = this.data;
    const productCategory =
      referenceStyleCategories.find((c) => c.id === selectedRefCategory) ||
      referenceStyleCategories[0];
    const publishCh =
      publishChannels.find((c) => c.id === selectedPublishChannel) || publishChannels[0];
    const copyStyleRow =
      copywritingStyleOptions.find((s) => s.id === selectedCopywritingStyle) ||
      copywritingStyleOptions[0];
    const ecomRow =
      ecomPlatformOptions.find((e) => e.id === selectedEcomPlatform) || ecomPlatformOptions[0];
    const titleStyleRow =
      titleStyleOptions.find((t) => t.id === selectedTitleStyle) || titleStyleOptions[0];
    const hint = (productInput && productInput.trim())
      ? productInput.trim().slice(0, 24)
      : '心仪好物';

    const titleTexts = [
      `一口沦陷｜${hint}，今日份小惊喜上线`,
      `门店实拍｜关于「${hint}」，我们想说的都在这里`,
      `打卡推荐｜这款${hint}被客人追问无数次`,
      `氛围感拉满｜把好物分享给在意的人`,
      `新品手记｜从选材到出品，每一步都用心`,
      `闺蜜安利｜回购三次不踩雷的宝藏款`,
      `下班治愈系｜用一点甜犒劳认真生活的你`
    ];

    const copyTexts = [
      `今日新鲜呈现，${hint}细节满分随手一拍都出片，适合发圈晒单～想了解更多欢迎留言，我们看到都会回！`,
      `招牌推荐：${hint}。品质稳定、口感在线，门店支持自提，提前私信可帮你预留。周末客流大，建议错峰到店哦。`,
      `把好物写成故事：${hint}不只是产品，更是对味觉的小执着。点赞收藏不迷路，下期分享更多幕后花絮～`
    ];

    const titleOptions = titleTexts.map((text, i) => ({ id: i + 1, text }));
    const copyOptions = copyTexts.map((text, i) => ({ id: i + 1, text }));

    let refStyleRow = null;
    for (const c of referenceStyleCategories) {
      const found = c.styles.find((s) => s.id === selectedReferenceStyleId);
      if (found) {
        refStyleRow = found;
        break;
      }
    }

    const useCustomRef = !!referenceImageUrl;
    const referenceForApi = useCustomRef
      ? referenceImageUrl
      : (refStyleRow ? refStyleRow.imageUrl : '');
    const isEcom = selectedPublishChannel === 4;

    return {
      // 严格按工作流参数命名
      product_name: (productInput || '').trim(),
      category: isEcom ? '' : productCategory.name,
      original_image: uploadedImageUrl || '',
      reference: referenceForApi,
      reference_str: isEcom ? '' : (useCustomRef ? '' : (refStyleRow ? refStyleRow.name : '')),
      platform: publishCh.name,
      copywriting: isEcom ? '' : copyStyleRow.name,
      user_desc: supplementText || '',
      // 页面展示所需衍生字段
      platformName: publishCh.name,
      imageUrl: '',
      titleOptions: isEcom ? [] : titleOptions,
      copyOptions: isEcom ? [] : copyOptions,
      resultImageOnly: isEcom
    };
  },

  async uploadPresetReferenceToCloud() {
    const {
      refInputMode,
      selectedReferenceStyleId,
      referenceStyleCategories
    } = this.data;
    if (refInputMode !== 'preset') return '';

    const styleId = selectedReferenceStyleId;
    if (!styleId) return '';
    if (this.presetStyleCloudUrlMap && this.presetStyleCloudUrlMap[styleId]) {
      return this.presetStyleCloudUrlMap[styleId];
    }

    let styleRow = null;
    for (const cat of referenceStyleCategories) {
      const found = cat.styles.find((s) => s.id === styleId);
      if (found) {
        styleRow = found;
        break;
      }
    }
    if (!styleRow || !styleRow.imageUrl) return '';

    const imageInfo = await new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: styleRow.imageUrl,
        success: resolve,
        fail: reject
      });
    });
    const localFilePath = imageInfo.path || styleRow.imageUrl;
    const cloudUrl = await this.uploadImageToCloud(localFilePath, 'preset');
    this.presetStyleCloudUrlMap[styleId] = cloudUrl;
    wx.showModal({
      title: '图片上传成功',
      content: `图片URL:\n${cloudUrl}`,
      showCancel: false,
      confirmText: '知道了'
    });
    return cloudUrl;
  },

  parseCozeResult(rawData) {
    const splitToken = '###';
    const parseJsonSafely = (text) => {
      if (!text || typeof text !== 'string' || !text.trim()) return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        try {
          const unquoted = text.replace(/^"|"$/g, '').replace(/\\"/g, '"');
          return JSON.parse(unquoted);
        } catch (e2) {
          return null;
        }
      }
    };
    const extractImageUrl = (text) => {
      if (typeof text !== 'string' || !text.trim()) return '';
      const mdMatch = text.match(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/);
      if (mdMatch && mdMatch[1]) return mdMatch[1];
      const directMatch = text.match(/https?:\/\/[^\s)]+/);
      if (directMatch && directMatch[0]) return directMatch[0];
      return '';
    };
    const isCopyJson = (obj) => !!(
      obj &&
      typeof obj === 'object' &&
      (Array.isArray(obj.titles) || Array.isArray(obj.copywritings))
    );

    // 结束节点可能把数据放在任意返回变量：output/data/output1/output2
    const candidates = [rawData.output, rawData.data, rawData.output1, rawData.output2, rawData.result, rawData.imageUrl]
      .filter((v) => v !== undefined && v !== null);

    let imageUrl = '';
    let parsed = {};

    for (const item of candidates) {
      if (typeof item === 'string') {
        // 格式1：url###json
        if (item.includes(splitToken)) {
          const idx = item.indexOf(splitToken);
          const maybeUrl = item.slice(0, idx).trim();
          const maybeJsonText = item.slice(idx + splitToken.length).trim();
          if (!imageUrl) imageUrl = extractImageUrl(maybeUrl) || maybeUrl;
          const maybeJson = parseJsonSafely(maybeJsonText);
          if (!parsed || !Object.keys(parsed).length) {
            if (isCopyJson(maybeJson)) parsed = maybeJson;
          }
          continue;
        }

        // 格式2：纯URL/markdown图片
        if (!imageUrl) {
          const u = extractImageUrl(item);
          if (u) imageUrl = u;
        }

        // 格式3：纯JSON字符串（或被转义JSON字符串）
        const maybeObj = parseJsonSafely(item);
        if ((!parsed || !Object.keys(parsed).length) && isCopyJson(maybeObj)) {
          parsed = maybeObj;
        }
      } else if (typeof item === 'object') {
        // 格式4：对象直接返回
        if (!imageUrl && typeof item.imageUrl === 'string') {
          imageUrl = extractImageUrl(item.imageUrl) || item.imageUrl;
        }
        if ((!parsed || !Object.keys(parsed).length) && isCopyJson(item)) {
          parsed = item;
        }
      }
    }

    const titles = Array.isArray(parsed.titles) ? parsed.titles : [];
    const copies = Array.isArray(parsed.copywritings) ? parsed.copywritings : [];
    const titleOptions = titles.map((item, i) => ({
      id: i + 1,
      text: typeof item === 'string' ? item : (item.content || '')
    })).filter((x) => x.text);
    const copyOptions = copies.map((item, i) => ({
      id: i + 1,
      text: typeof item === 'string' ? item : (item.content || '')
    })).filter((x) => x.text);

    return {
      imageUrl,
      titleOptions,
      copyOptions
    };
  },

  // 开始生成
  startGenerate() {
    wx.showModal({
      title: '温馨提示',
      content:
        '生成时间可能需要几分钟。您可以先行退出小程序，待图片生成完成后，将以微信通知的形式告知您。',
      confirmText: '开始生成',
      cancelText: '取消',
      success: (modalRes) => {
        if (!modalRes.confirm) return;
        this.afterGenerateConfirmed();
      }
    });
  },

  /**
   * 将接口返回的生成结果写入第五步（与 buildMockResultPayload 字段对齐）
   * 接入真实 API 后轮询/推送成功后同样调用本方法即可切换到结果态
   */
  applyGenerationResult(payload) {
    const titles = payload.titleOptions || [];
    const copies = payload.copyOptions || [];
    const showTitles = titles.length > 0;
    const firstT = showTitles && titles[0] ? titles[0].id : null;
    const firstC = copies[0] ? copies[0].id : null;
    this.setData({
      generating: false,
      resultReady: true,
      resultImageUrl: payload.imageUrl,
      resultPlatformName: payload.platformName,
      resultImageOnly: !!payload.resultImageOnly,
      resultShowTitles: showTitles,
      resultTitleOptions: titles,
      resultCopyOptions: copies,
      resultSelectedTitleId: firstT,
      resultSelectedCopyId: firstC
    });
  },

  onResultDownloadImage() {
    const url = this.data.resultImageUrl;
    if (!url) return;
    wx.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode !== 200) {
          wx.showToast({ title: '下载失败', icon: 'none' });
          return;
        }
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
          fail: () => wx.showToast({ title: '保存失败，请检查权限', icon: 'none' })
        });
      },
      fail: () => wx.showToast({ title: '下载失败', icon: 'none' })
    });
  },

  afterGenerateConfirmed() {
    const subscribeTmplIds = [];
    const fallbackString = (val, fallback = '无') => {
      if (val === null || val === undefined) return fallback;
      if (typeof val === 'string') {
        const t = val.trim();
        return t ? t : fallback;
      }
      return String(val);
    };
    const fallbackImage = (val) => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') return val.trim();
      return '';
    };

    const runTask = async () => {
      this.setData({
        currentStep: 5,
        generating: true,
        resultReady: false
      });
      try {
        const workflowId = CozeConfig.WORKFLOW_IDS.MAIN_WORKFLOW;
        const params = this.buildMockResultPayload();
        if (this.data.refInputMode === 'preset' && this.data.selectedPublishChannel !== 4) {
          const presetCloudUrl = await this.uploadPresetReferenceToCloud();
          if (presetCloudUrl) {
            params.reference = presetCloudUrl;
          }
        }
        const isEcom = this.data.selectedPublishChannel === 4;
        const cozeInput = isEcom
          ? {
              platform: fallbackString(params.platform),
              product_name: fallbackString(params.product_name),
              original_image: fallbackImage(params.original_image),
              reference: fallbackImage(params.reference),
              user_desc: fallbackString(params.user_desc)
            }
          : {
              product_name: fallbackString(params.product_name),
              category: fallbackString(params.category),
              original_image: fallbackImage(params.original_image),
              reference: fallbackImage(params.reference),
              reference_str: fallbackString(params.reference_str),
              platform: fallbackString(params.platform),
              copywriting: fallbackString(params.copywriting),
              user_desc: fallbackString(params.user_desc)
            };
        const cozeRes = await CozeSdk.callWorkflow({
          workflowId,
          input: cozeInput,
          timeout: 300000
        });
        if (!cozeRes.success) {
          throw new Error(cozeRes.error || '调用工作流失败');
        }
        const parsed = this.parseCozeResult(cozeRes.data || {});
        const payload = {
          platformName: params.platform,
          imageUrl: parsed.imageUrl || '',
          titleOptions: parsed.titleOptions.length ? parsed.titleOptions : params.titleOptions,
          copyOptions: parsed.copyOptions.length ? parsed.copyOptions : params.copyOptions,
          resultImageOnly: !!params.resultImageOnly
        };
        if (!payload.imageUrl) {
          throw new Error('工作流返回中未包含生成图片URL');
        }
        wx.setStorageSync('lastCreateResult', payload);
        this.applyGenerationResult(payload);
      } catch (err) {
        this.setData({
          generating: false,
          resultReady: false,
          currentStep: 4
        });
        wx.showModal({
          title: '生成失败',
          content: err.message || '请稍后重试',
          showCancel: false
        });
      }
    };

    if (subscribeTmplIds.length > 0) {
      wx.requestSubscribeMessage({
        tmplIds: subscribeTmplIds,
        complete: () => runTask()
      });
    } else {
      runTask();
    }
  }
});
