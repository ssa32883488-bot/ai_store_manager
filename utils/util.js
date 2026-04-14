/**
 * 公共工具函数
 */

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func 要执行的函数
 * @param {number} interval 间隔时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

/**
 * 显示提示
 * @param {string} title 提示内容
 * @param {string} icon 图标类型
 * @param {number} duration 显示时长
 */
function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title,
    icon,
    duration
  });
}

/**
 * 显示加载中
 * @param {string} title 提示文字
 * @param {boolean} mask 是否显示遮罩
 */
function showLoading(title = '加载中...', mask = true) {
  wx.showLoading({
    title,
    mask
  });
}

/**
 * 隐藏加载中
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 本地存储封装
 */
const storage = {
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('存储失败:', e);
      return false;
    }
  },
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } catch (e) {
      console.error('读取失败:', e);
      return defaultValue;
    }
  },
  remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error('删除失败:', e);
      return false;
    }
  },
  clear() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      console.error('清空失败:', e);
      return false;
    }
  }
};

/**
 * 网络请求封装
 * @param {Object} options 请求配置
 * @returns {Promise} 请求结果
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
}

/**
 * rpx 转 px
 * @param {number} rpx rpx 值
 * @returns {number} px 值
 */
function rpx2px(rpx) {
  const windowWidth = wx.getSystemInfoSync().windowWidth;
  return (rpx / 750) * windowWidth;
}

/**
 * px 转 rpx
 * @param {number} px px 值
 * @returns {number} rpx 值
 */
function px2rpx(px) {
  const windowWidth = wx.getSystemInfoSync().windowWidth;
  return (px * 750) / windowWidth;
}

module.exports = {
  formatDate,
  debounce,
  throttle,
  showToast,
  showLoading,
  hideLoading,
  storage,
  request,
  rpx2px,
  px2rpx
};
