/**
 * Coze SDK - OAuth认证模块
 * 
 * 本模块提供OAuth认证相关功能，包括:
 * - 获取私钥
 * - 生成JWT令牌
 * - 获取Access Token
 * 
 * 版本: 1.0.0
 * 创建日期: 2024-07-11
 */

// 导入配置
const { APP_CONFIG, OAUTH_CONFIG } = require('./config');

/**
 * 获取私钥
 * 
 * @returns {Promise<string>} 获取到的私钥内容
 */
async function fetchPrivateKey() {
  try {
    console.log('[CozeSdk] 开始获取私钥, 路径:', APP_CONFIG.PRIVATE_KEY_URL);
    
    // 检查URL是否已配置
    if (!APP_CONFIG.PRIVATE_KEY_URL) {
      throw new Error('未配置私钥URL，请在config.js中设置PRIVATE_KEY_URL');
    }
    
    // 如果缓存中有有效的私钥，直接返回
    if (APP_CONFIG.PRIVATE_KEY_CACHE && 
        APP_CONFIG.PRIVATE_KEY_CACHE.content && 
        APP_CONFIG.PRIVATE_KEY_CACHE.expiresAt > Date.now()) {
      console.log('[CozeSdk] 使用缓存的私钥');
      return APP_CONFIG.PRIVATE_KEY_CACHE.content;
    }

    // 从本地文件读取私钥
    return new Promise((resolve, reject) => {
      console.log('[CozeSdk] 从本地文件读取私钥...');
      
      wx.getFileSystemManager().readFile({
        filePath: APP_CONFIG.PRIVATE_KEY_URL,
        encoding: 'utf-8',
        success: (res) => {
          console.log('[CozeSdk] 私钥文件读取成功');
          
          // 检查响应数据
          if (!res.data) {
            const error = new Error('读取私钥失败，文件内容为空');
            console.error('[CozeSdk]', error.message);
            return reject(error);
          }
          
          console.log('[CozeSdk] 获取到私钥内容，类型:', typeof res.data);
          
          // 处理文件内容
          let privateKeyContent = res.data;
          
          // 确保私钥内容是字符串
          if (typeof privateKeyContent !== 'string') {
            const error = new Error('私钥内容不是字符串');
            console.error('[CozeSdk]', error.message);
            return reject(error);
          }
          
          // 检查私钥内容是否为空
          if (!privateKeyContent.trim()) {
            const error = new Error('获取的私钥内容为空');
            console.error('[CozeSdk]', error.message);
            return reject(error);
          }
          
          // 确保私钥包含必要的PEM头尾
          let formattedKey = privateKeyContent.trim();
          
          // 检查和修正私钥格式
          if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
            console.log('[CozeSdk] 添加私钥起始标记');
            formattedKey = '-----BEGIN PRIVATE KEY-----\n' + formattedKey;
          }
          
          if (!formattedKey.includes('-----END PRIVATE KEY-----')) {
            console.log('[CozeSdk] 添加私钥结束标记');
            formattedKey = formattedKey + '\n-----END PRIVATE KEY-----';
          }
          
          // 缓存私钥，默认24小时有效
          if (!APP_CONFIG.PRIVATE_KEY_CACHE) {
            APP_CONFIG.PRIVATE_KEY_CACHE = {};
          }
          
          APP_CONFIG.PRIVATE_KEY_CACHE.content = formattedKey;
          APP_CONFIG.PRIVATE_KEY_CACHE.expiresAt = Date.now() + (24 * 60 * 60 * 1000);
          
          console.log('[CozeSdk] 成功获取私钥，长度:', formattedKey.length);
          resolve(formattedKey);
        },
        fail: (error) => {
          console.error('[CozeSdk] 读取私钥文件错误:', error);
          reject(new Error('读取私钥文件错误: ' + (error.errMsg || '未知错误')));
        }
      });
    });
  } catch (error) {
    console.error('[CozeSdk] 获取私钥异常:', error);
    throw error;
  }
}

/**
 * 生成JWT令牌
 * 
 * @returns {Promise<string>} 生成的JWT令牌
 */
async function generateJWT() {
  try {
    // 获取私钥
    const privateKey = await fetchPrivateKey();
    
    // 调用云函数生成JWT
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: OAUTH_CONFIG.CLOUD_FUNCTION,
        data: {
          appId: APP_CONFIG.APP_ID,
          privateKey: privateKey,
          kid: APP_CONFIG.KID
        },
        success: res => {
          if (res.result && res.result.token) {
            console.log('[CozeSdk] 成功生成JWT令牌');
            resolve(res.result.token);
          } else {
            console.error('[CozeSdk] 生成JWT令牌失败:', res);
            reject(new Error('生成JWT令牌失败: ' + (res.result?.error || '未知错误')));
          }
        },
        fail: err => {
          console.error('[CozeSdk] 调用生成JWT云函数失败:', err);
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('[CozeSdk] 生成JWT令牌异常:', error);
    throw error;
  }
}

/**
 * 使用JWT交换获取OAuth Access Token
 * 
 * @param {string} jwt - JWT令牌
 * @returns {Promise<{access_token: string, expires_in: number}>} 获取的access token信息
 */
async function exchangeJwtForAccessToken(jwt) {
  try {
    console.log('[CozeSdk] 开始使用JWT交换Access Token');
    
    return new Promise((resolve, reject) => {
      // 请求头
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      };
      
      // 请求体 - 根据官方文档，access token有效期为15分钟，不支持设置更长时间
      const requestData = {
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer'
        // 移除duration_seconds字段，因为官方不支持自定义有效期
      };
      
      console.log('[CozeSdk] 请求OAuth端点:', OAUTH_CONFIG.TOKEN_URL);
      
      // 发送请求
      wx.request({
        url: OAUTH_CONFIG.TOKEN_URL,
        method: 'POST',
        header: headers,
        data: requestData,
        success: (res) => {
          console.log(`[CozeSdk] OAuth响应状态码:`, res.statusCode);
          
          if (res.statusCode === 200 && res.data && res.data.access_token) {
            console.log(`[CozeSdk] 成功获取Access Token, 响应:`, JSON.stringify(res.data));
            
            // 确保使用正确的过期时间（15分钟）
            let expiresIn = 15 * 60; // 默认15分钟（900秒）
            
            // 防止解析错误：根据官方文档应该是15分钟
            if (res.data.expires_in) {
              // 检查返回的expires_in是否是大于一天的时间戳
              if (res.data.expires_in > 86400) {
                // 可能是时间戳而不是剩余秒数，计算剩余秒数
                const expiresAt = new Date(res.data.expires_in * 1000);
                const now = new Date();
                // 如果expires_in是未来的时间戳，计算相对时间
                if (expiresAt > now) {
                  expiresIn = Math.floor((expiresAt - now) / 1000);
                }
                console.log(`[CozeSdk] 检测到可能的时间戳: ${res.data.expires_in}，转换为相对时间: ${expiresIn}秒`);
              } else {
                // 是合理的剩余秒数
                expiresIn = res.data.expires_in;
              }
            }
            
            // 确保在合理范围内（最多1小时，至少5分钟）
            if (expiresIn > 3600) {
              console.log(`[CozeSdk] 过期时间过长，限制为1小时 (${expiresIn} -> 3600)`);
              expiresIn = 3600;
            } else if (expiresIn < 300) {
              console.log(`[CozeSdk] 过期时间过短，设置为5分钟 (${expiresIn} -> 300)`);
              expiresIn = 300;
            }
            
            resolve({
              access_token: res.data.access_token,
              expires_in: expiresIn 
            });
          } else {
            const errorMsg = `获取Access Token失败，状态码: ${res.statusCode}，错误: ${JSON.stringify(res.data || '无错误信息')}`;
            console.error('[CozeSdk] ' + errorMsg);
            reject(new Error(errorMsg));
          }
        },
        fail: (error) => {
          console.error('[CozeSdk] 请求Access Token网络错误:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('[CozeSdk] 交换Access Token异常:', error);
    throw error;
  }
}

/**
 * 获取有效的OAuth Access Token
 * 优先使用缓存的令牌，如果过期或接近过期则重新获取
 * 根据官方文档，JWT只能使用一次，Access Token有效期为15分钟
 * 
 * @returns {Promise<string>} 有效的access token
 */
async function getAuthToken() {
  try {
    const now = Date.now();
    
    // 检查缓存中的令牌是否有效
    // 考虑到15分钟的有效期较短，设置2分钟的提前刷新时间
    const refreshThreshold = 2 * 60 * 1000; // 2分钟
    
    if (OAUTH_CONFIG.TOKEN_CACHE.token && 
        OAUTH_CONFIG.TOKEN_CACHE.expiresAt > (now + refreshThreshold)) {
      console.log('[CozeSdk] 使用缓存的Access Token');
      return OAUTH_CONFIG.TOKEN_CACHE.token;
    }
    
    console.log('[CozeSdk] 需要获取新的Access Token, 当前时间:', new Date(now).toLocaleString());
    if (OAUTH_CONFIG.TOKEN_CACHE.expiresAt) {
      console.log('[CozeSdk] 上一个token过期时间:', new Date(OAUTH_CONFIG.TOKEN_CACHE.expiresAt).toLocaleString());
    }
    
    // 每次都需要重新生成JWT，因为JWT只能使用一次
    const jwt = await generateJWT();
    
    // 交换获取Access Token
    const tokenInfo = await exchangeJwtForAccessToken(jwt);
    
    // 缓存令牌和过期时间
    OAUTH_CONFIG.TOKEN_CACHE.token = tokenInfo.access_token;
    OAUTH_CONFIG.TOKEN_CACHE.expiresAt = now + (tokenInfo.expires_in * 1000);
    
    console.log('[CozeSdk] 成功获取新的Access Token，有效期:', tokenInfo.expires_in, '秒');
    console.log('[CozeSdk] 新token过期时间:', new Date(OAUTH_CONFIG.TOKEN_CACHE.expiresAt).toLocaleString());
    
    return tokenInfo.access_token;
  } catch (error) {
    console.error('[CozeSdk] 获取Auth Token失败:', error);
    throw error;
  }
}

/**
 * 获取用于API调用的授权头
 * 
 * @returns {Promise<Object>} 包含授权头信息的对象
 */
async function getAuthHeader() {
  try {
    const token = await getAuthToken();
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('[CozeSdk] 获取授权头失败:', error);
    throw error;
  }
}

// 导出函数
module.exports = {
  fetchPrivateKey,
  generateJWT,
  exchangeJwtForAccessToken,
  getAuthToken,
  getAuthHeader
}; 