/**
 * Coze SDK - 工作流调用模块
 * 
 * 本模块提供工作流调用相关功能，包括:
 * - 调用工作流
 * - 处理工作流返回数据
 * - 重试机制
 * 
 * 版本: 1.0.0
 * 创建日期: 2024-07-11
 */

// 导入配置和OAuth模块
const { API_CONFIG } = require('./config');
const { getAuthHeader } = require('./oauth');

/**
 * 带重试的异步操作执行
 * 
 * @param {Function} operation - 要执行的异步操作
 * @param {number} maxRetries - 最大重试次数
 * @param {number} baseDelay - 基础延迟(毫秒)
 * @returns {Promise<any>} 操作结果
 */
async function withRetry(operation, maxRetries = API_CONFIG.RETRY.maxRetries, baseDelay = API_CONFIG.RETRY.baseDelay) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 尝试执行操作
      return await operation();
    } catch (error) {
      lastError = error;
      
      // 判断是否继续重试
      if (attempt < maxRetries && shouldRetry(error)) {
        // 计算延迟时间(指数退避)
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[CozeSdk] 操作失败，将在${delay}ms后重试(${attempt + 1}/${maxRetries})，错误:`, error.message);
        
        // 等待后继续
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // 不继续重试
        break;
      }
    }
  }
  
  // 所有重试都失败了
  throw lastError;
}

/**
 * 判断是否应该重试请求
 * 
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否应该重试
 */
function shouldRetry(error) {
  // 如果重试功能已禁用，直接返回false
  if (!API_CONFIG.RETRY.enabled) return false;
  
  // 检查错误类型
  if (!error) return false;
  
  // 获取状态码(如果有)
  const statusCode = error.statusCode || (error.errMsg && error.errMsg.includes('status code:') 
    ? parseInt(error.errMsg.split('status code:')[1]) 
    : null);
  
  // 根据状态码判断是否重试
  if (statusCode) {
    // 对于这些状态码应该重试
    return statusCode === 429 || statusCode >= 500 || statusCode === 408;
  }
  
  // 对于网络错误应该重试
  return error.errMsg && (
    error.errMsg.includes('timeout') || 
    error.errMsg.includes('断开') || 
    error.errMsg.includes('fail') ||
    error.errMsg.includes('网络') ||
    error.errMsg.includes('network')
  );
}

/**
 * 调用Coze工作流
 * 
 * @param {Object} params - 调用参数
 * @param {string} params.workflow_id - 工作流ID
 * @param {Object} [params.parameters] - 工作流参数
 * @param {number} [params.timeout] - 超时时间(毫秒)
 * @returns {Promise<Object>} 工作流执行结果
 */
async function callWorkflow(params) {
  // 验证参数
  if (!params || !params.workflow_id) {
    throw new Error('缺少必要参数: workflow_id');
  }
  
  // 详细记录请求参数
  console.log('[CozeSdk] 调用工作流详细信息:', {
    workflow_id: params.workflow_id,
    parameters: JSON.stringify(params.parameters),
    timeout: params.timeout || API_CONFIG.TIMEOUT
  });
  
  // 使用重试机制执行请求
  return withRetry(async () => {
    console.log('[CozeSdk] 调用工作流, ID:', params.workflow_id);
    
    // 获取授权头
    const authHeader = await getAuthHeader();
    console.log('[CozeSdk] 获取到认证头:', JSON.stringify(authHeader));
    
    // 发送请求
    return new Promise((resolve, reject) => {
      // 准备请求数据 - 按照Coze API文档格式化
      const requestData = {
        workflow_id: params.workflow_id,  // 使用workflow_id字段
        parameters: params.parameters || {}  // 使用parameters字段
      };
      
      console.log('[CozeSdk] 发送请求到:', API_CONFIG.API_URL);
      console.log('[CozeSdk] 请求数据:', JSON.stringify(requestData));
      
      wx.request({
        url: API_CONFIG.API_URL,
        method: 'POST',
        header: authHeader,
        data: requestData,
        timeout: params.timeout || API_CONFIG.TIMEOUT,
        success: (res) => {
          console.log('[CozeSdk] 收到响应状态码:', res.statusCode);
          console.log('[CozeSdk] 响应头:', JSON.stringify(res.header || {}));
          console.log('[CozeSdk] 原始响应数据类型:', typeof res.data);
          console.log('[CozeSdk] 原始响应数据:', typeof res.data === 'object' ? JSON.stringify(res.data) : res.data);
          
          // Coze业务错误统一按失败处理（如4200: workflow not found）
          if (res.data && typeof res.data === 'object' && res.data.code !== undefined && Number(res.data.code) !== 0) {
            console.error('[CozeSdk] 工作流业务错误，详细信息:', res.data.msg);
            const error = new Error(`工作流业务错误(${res.data.code}): ${res.data.msg || '未知错误'}`);
            error.statusCode = res.statusCode;
            error.response = res.data;
            reject(error);
            return;
          }
          
          if (res.statusCode !== 200) {
            // 格式化错误信息
            let errorMessage = `工作流调用失败，状态码: ${res.statusCode}`;
            
            // 尝试提取更详细的错误信息
            if (res.data) {
              if (typeof res.data === 'object') {
                const errorDetails = [];
                if (res.data.code) errorDetails.push(`错误码: ${res.data.code}`);
                if (res.data.msg) errorDetails.push(`消息: ${res.data.msg}`);
                if (res.data.message) errorDetails.push(`消息: ${res.data.message}`);
                if (errorDetails.length > 0) {
                  errorMessage += `, ${errorDetails.join(', ')}`;
                }
              } else if (typeof res.data === 'string') {
                errorMessage += `, 错误: ${res.data}`;
              }
            }
            
            console.error('[CozeSdk] 错误响应:', errorMessage);
            
            // 创建包含状态码的错误对象
            const error = new Error(errorMessage);
            error.statusCode = res.statusCode;
            error.response = res.data;
            reject(error);
            return;
          }
          
          console.log('[CozeSdk] 工作流调用成功, 返回数据类型:', typeof res.data);
          if (typeof res.data === 'object') {
            console.log('[CozeSdk] 返回数据结构:', Object.keys(res.data).join(', '));
          }
          
          resolve(res.data);
        },
        fail: (error) => {
          console.error('[CozeSdk] 工作流调用网络错误:', error);
          reject(error);
        }
      });
    });
  });
}

/**
 * 解析工作流响应数据
 * 尝试将字符串响应解析为JSON对象
 * 
 * @param {Object} response - 工作流原始响应
 * @returns {Object} 解析后的数据
 */
function parseWorkflowResponse(response) {
  try {
    console.log('[CozeSdk] 开始解析工作流响应, 类型:', typeof response);
    
    // 如果没有响应
    if (!response) {
      console.error('[CozeSdk] 响应为空');
      return { success: false, error: '响应数据为空' };
    }
    
    // 检查响应是否有data属性
    console.log('[CozeSdk] 响应结构:', Object.keys(response).join(', '));
    
    // 如果没有data字段
    if (response.data === undefined) {
      console.error('[CozeSdk] 响应中没有data字段');
      return { success: false, error: '响应中没有data字段', raw: response };
    }
    
    const data = response.data;
    console.log('[CozeSdk] 响应data类型:', typeof data);
    
    // 如果data已经是对象，直接返回
    if (typeof data === 'object' && data !== null) {
      console.log('[CozeSdk] data是对象,键:', Object.keys(data).join(', '));
      return { success: true, data: data };
    }
    
    // 如果data是字符串，尝试解析为JSON
    if (typeof data === 'string') {
      console.log('[CozeSdk] data是字符串,长度:', data.length);
      
      // 如果是空字符串
      if (!data.trim()) {
        console.warn('[CozeSdk] data是空字符串');
        return { success: true, data: { message: '工作流返回了空字符串' } };
      }
      
      try {
        // 尝试解析JSON字符串
        const parsed = JSON.parse(data);
        console.log('[CozeSdk] 成功解析JSON字符串,键:', Object.keys(parsed).join(', '));
        return { success: true, data: parsed };
      } catch (jsonError) {
        // 如果不是有效的JSON，将其作为普通文本返回
        console.log('[CozeSdk] 不是JSON,作为文本返回');
        return { success: true, data: { text: data } };
      }
    }
    
    // 返回原始数据
    console.log('[CozeSdk] 返回原始数据,类型:', typeof data);
    return { success: true, data: data };
  } catch (error) {
    console.error('[CozeSdk] 解析工作流响应失败:', error);
    return { success: false, error: '解析响应数据失败: ' + error.message, raw: response };
  }
}

// 导出函数
module.exports = {
  callWorkflow,
  parseWorkflowResponse,
  withRetry
}; 