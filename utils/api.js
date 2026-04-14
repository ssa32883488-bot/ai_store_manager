/**
 * API 接口封装
 * AI小店长 - 后端接口调用
 */

const BASE_URL = 'https://api.example.com'; // 替换为实际的后端 API 地址

/**
 * 通用请求方法
 */
function request(method, url, data = {}, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      method,
      url: `${BASE_URL}${url}`,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('token') || ''}`
      },
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // 未授权，跳转登录
          wx.redirectTo({
            url: '/pages/login/login'
          });
          reject(new Error('未登录'));
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

// GET 请求
const get = (url, params = {}) => request('GET', url, params);

// POST 请求
const post = (url, data = {}) => request('POST', url, data);

// PUT 请求
const put = (url, data = {}) => request('PUT', url, data);

// DELETE 请求
const del = (url) => request('DELETE', url);

/**
 * 用户相关 API
 */
const userApi = {
  // 微信登录
  wxLogin: (code) => post('/auth/wx-login', { code }),
  
  // 获取用户信息
  getProfile: () => get('/user/profile'),
  
  // 更新用户信息
  updateProfile: (data) => put('/user/profile', data),
  
  // 获取剩余次数
  getCredits: () => get('/user/credits')
};

/**
 * 创作相关 API
 */
const creationApi = {
  // 极简模式 - 开始生成
  simpleCreate: (data) => post('/create/simple', data),
  
  // 专业模式 - 开始生成
  proCreate: (data) => post('/create/pro', data),
  
  // 获取灵感模板
  getTemplates: () => get('/templates'),
  
  // 获取创作历史
  getHistory: (page = 1, size = 20) => get('/creations', { page, size }),
  
  // 获取草稿列表
  getDrafts: () => get('/drafts'),
  
  // 保存草稿
  saveDraft: (data) => post('/drafts', data),
  
  // 删除草稿
  deleteDraft: (id) => del(`/drafts/${id}`)
};

/**
 * 充值相关 API
 */
const rechargeApi = {
  // 获取套餐列表
  getPlans: () => get('/recharge/plans'),
  
  // 创建订单
  createOrder: (planId) => post('/recharge/order', { planId }),
  
  // 查询订单状态
  queryOrder: (orderId) => get(`/recharge/order/${orderId}`)
};

module.exports = {
  request,
  get,
  post,
  put,
  del,
  userApi,
  creationApi,
  rechargeApi
};
