/**
 * Coze JWT生成云函数
 * 本云函数用于生成用于Coze OAuth认证的JWT令牌
 */
const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event) => {
  try {
    if (!event.appId || !event.privateKey || !event.kid) {
      const missingParams = [];
      if (!event.appId) missingParams.push('appId');
      if (!event.privateKey) missingParams.push('privateKey');
      if (!event.kid) missingParams.push('kid');
      return {
        success: false,
        error: `缺少必要参数: ${missingParams.join(', ')}`
      };
    }

    if (!event.privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return {
        success: false,
        error: '私钥格式错误: 缺少BEGIN标记'
      };
    }

    const token = generateJWT(event.appId, event.privateKey, event.kid);
    return {
      success: true,
      token
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || '生成JWT令牌失败'
    };
  }
};

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randValues = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randValues[i] % chars.length];
  }
  return result;
}

function generateJWT(appId, privateKeyPem, kidValue) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
    kid: kidValue
  };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: appId,
    aud: 'api.coze.cn',
    iat: now,
    exp: now + 3600,
    jti: generateRandomString(32)
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(privateKeyPem, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${signatureInput}.${signature}`;
}
