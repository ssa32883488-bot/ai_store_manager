/**
 * Coze JWT生成云函数
 * 
 * 本云函数用于生成用于Coze OAuth认证的JWT令牌
 * 版本: 1.0.0
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')
const crypto = require('crypto')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log('开始生成JWT，参数:', {
      appId: event.appId,
      kid: event.kid ? (event.kid.substring(0, 8) + '...') : 'undefined',
      privateKeyLength: event.privateKey ? event.privateKey.length : 0
    });
    
    // 验证必要参数
    if (!event.appId || !event.privateKey || !event.kid) {
      const missingParams = [];
      if (!event.appId) missingParams.push('appId');
      if (!event.privateKey) missingParams.push('privateKey');
      if (!event.kid) missingParams.push('kid');
      
      const errorMsg = '缺少必要参数: ' + missingParams.join(', ');
      console.error(errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }
    
    // 检查私钥格式
    if (!event.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.error('私钥格式错误: 缺少BEGIN标记');
      return {
        success: false,
        error: '私钥格式错误: 缺少BEGIN标记'
      };
    }
    
    // 生成JWT令牌
    const token = generateJWT(event.appId, event.privateKey, event.kid);
    console.log('JWT生成成功，长度:', token.length);
    
    return {
      success: true,
      token: token
    };
  } catch (error) {
    console.error('生成JWT令牌失败:', error);
    return {
      success: false,
      error: error.message || '生成JWT令牌失败'
    };
  }
};

/**
 * 生成随机字符串
 * 用于JWT的jti字段
 * 
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randValues = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randValues[i] % chars.length];
  }
  
  return result;
}

/**
 * 生成JWT令牌
 * 
 * @param {string} appId - 应用ID
 * @param {string} privateKeyPem - PEM格式的私钥
 * @param {string} kidValue - 公钥指纹
 * @returns {string} 生成的JWT令牌
 */
function generateJWT(appId, privateKeyPem, kidValue) {
  try {
    // 创建JWT头部，使用RS256算法
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: kidValue // 使用公钥指纹作为kid
    };
    
    // 创建JWT负载，注意字段要求
    const now = Math.floor(Date.now() / 1000);
    
    // 生成随机的jti (JWT ID)，用于防止重放攻击
    const jti = generateRandomString(32);
    
    const payload = {
      iss: appId,          // 发行者（应用ID）
      aud: 'api.coze.cn',  // 受众字段，固定为api.coze.cn
      iat: now,            // 签发时间
      exp: now + 3600,     // 过期时间（1小时后）
      jti: jti             // JWT ID, 随机字符串
    };
    
    // 对header和payload进行Base64编码
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
      
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // 创建签名内容
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    // 使用私钥进行签名
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(signatureInput);
    const signature = signer.sign(privateKeyPem, 'base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // 拼接JWT令牌
    return `${signatureInput}.${signature}`;
  } catch (error) {
    console.error('JWT生成错误:', error);
    throw error;
  }
} 