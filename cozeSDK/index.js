/**
 * Coze SDK - 主入口
 * 
 * 一个用于与Coze API交互的轻量级SDK
 * 提供OAuth认证和工作流调用功能
 * 
 * 版本: 1.0.0
 * 创建日期: 2024-07-11
 */

// 导入所有模块
const config = require('./config');
const oauth = require('./oauth');
const workflow = require('./workflow');

/**
 * 初始化SDK
 * 自动使用config.js中的配置初始化
 * 
 * @returns {Object} SDK实例
 */
function initialize() {
  try {
    console.log('[CozeSdk] 开始初始化SDK...');
    
    // 检查必要配置
    if (!config.APP_CONFIG.APP_ID) {
      console.error('[CozeSdk] 错误: 未配置APP_ID，请检查config.js中的APP_CONFIG配置项');
    }
    
    if (!config.APP_CONFIG.KID) {
      console.error('[CozeSdk] 错误: 未配置KID (公钥指纹)，请检查config.js中的APP_CONFIG配置项');
    }
    
    if (!config.APP_CONFIG.PRIVATE_KEY_URL) {
      console.error('[CozeSdk] 错误: 未配置PRIVATE_KEY_URL，请检查config.js中的APP_CONFIG配置项');
    }
    
    if (!config.WORKFLOW_IDS.MAIN_WORKFLOW) {
      console.error('[CozeSdk] 错误: 未配置主工作流ID，请在config.js中设置WORKFLOW_IDS.MAIN_WORKFLOW');
    }
    
    // 初始化缓存对象
    if (!config.APP_CONFIG.PRIVATE_KEY_CACHE) {
      config.APP_CONFIG.PRIVATE_KEY_CACHE = {};
      console.log('[CozeSdk] 初始化PRIVATE_KEY_CACHE');
    }
    
    if (!config.OAUTH_CONFIG.TOKEN_CACHE) {
      config.OAUTH_CONFIG.TOKEN_CACHE = {
        token: null,
        expiresAt: 0,
        refreshThreshold: 5 * 60 * 1000
      };
      console.log('[CozeSdk] 初始化TOKEN_CACHE');
    }
    
    // 初始化微信云环境
    if (wx && wx.cloud) {
      try {
        // 检查云环境ID是否已配置
        if (!config.CLOUD_ENV_ID) {
          console.error('[CozeSdk] 错误: 未配置云环境ID (CLOUD_ENV_ID)，请检查config.js');
          throw new Error('未配置云环境ID');
        }
        
        wx.cloud.init({
          env: config.CLOUD_ENV_ID,
          traceUser: true
        });
        console.log('[CozeSdk] 云环境初始化成功:', config.CLOUD_ENV_ID);
      } catch (error) {
        console.error('[CozeSdk] 云环境初始化失败:', error);
      }
    } else {
      console.error('[CozeSdk] 错误: wx.cloud不可用，请确保在微信小程序环境中运行，并且已开通云开发功能');
    }
    
    console.log('[CozeSdk] SDK初始化完成，配置:', {
      appId: config.APP_CONFIG.APP_ID,
      kid: config.APP_CONFIG.KID ? `${config.APP_CONFIG.KID.substring(0, 8)}...` : '未配置',
      cloudEnvId: config.CLOUD_ENV_ID || '未配置',
      privateKeyUrl: config.APP_CONFIG.PRIVATE_KEY_URL ? '已配置' : '未配置',
      mainWorkflowId: config.WORKFLOW_IDS.MAIN_WORKFLOW || '未配置'
    });
    
    return CozeSdk;
  } catch (error) {
    console.error('[CozeSdk] SDK初始化异常:', error);
    return CozeSdk; // 仍然返回SDK对象，让用户可以继续使用
  }
}

/**
 * 调用工作流
 * 
 * @param {Object|string} options - 调用选项或输入内容
 * @param {string} [options.workflowId] - 要调用的工作流ID，默认使用MAIN_WORKFLOW
 * @param {Object|string} [options.input] - 工作流输入参数
 * @param {number} [options.timeout] - 超时时间(毫秒)
 * @returns {Promise<Object>} 工作流调用结果 {success, data, error}
 * 
 * @example
 * // 简单调用(使用默认工作流)
 * const result = await CozeSdk.callWorkflow("你好");
 * 
 * // 使用对象参数调用(使用默认工作流)
 * const result = await CozeSdk.callWorkflow({
 *   input: "你好"
 * });
 * 
 * // 完整参数调用(指定工作流)
 * const result = await CozeSdk.callWorkflow({
 *   workflowId: "7490025887242747916",
 *   input: {
 *     user_id: "12345",
 *     message: "你好"
 *   }
 * });
 */
async function callWorkflow(options) {
  try {
    let params = {};
    
    // 字符串参数视为输入内容
    if (typeof options === 'string') {
      const workflowId = config.WORKFLOW_IDS.MAIN_WORKFLOW;
      
      // 获取工作流参数定义
      const paramDef = config.WORKFLOW_PARAMS[workflowId];
      
      // 根据参数定义格式化输入
      let formattedParams;
      if (paramDef) {
        console.log(`[CozeSdk] 使用工作流[${workflowId}]的参数定义:`, paramDef.paramName);
        if (paramDef.paramType === 'string') {
          // 简单字符串参数
          formattedParams = { [paramDef.paramName]: options };
        } else {
          // 如果定义的不是字符串但传入的是字符串，尝试适配
          console.warn(`[CozeSdk] 警告: 工作流期望${paramDef.paramType}类型参数，但传入的是字符串`);
          formattedParams = { [paramDef.paramName || 'input']: options };
        }
      } else {
        // 没有参数定义，使用默认的input参数名
        console.log('[CozeSdk] 未找到工作流参数定义，使用默认参数名"input"');
        formattedParams = { input: options };
      }
      
      params = {
        workflow_id: workflowId,
        parameters: formattedParams
      };
      
      console.log('[CozeSdk] 调用工作流(字符串输入):', workflowId, '参数:', JSON.stringify(formattedParams));
    } 
    // 对象参数需要进一步处理
    else if (typeof options === 'object' && options !== null) {
      // 确定工作流ID
      const workflowId = options.workflowId || config.WORKFLOW_IDS.MAIN_WORKFLOW;
      
      // 获取工作流参数定义
      const paramDef = config.WORKFLOW_PARAMS[workflowId];
      
      // 确定输入参数
      let inputParams;
      
      if (typeof options.input !== 'undefined') {
        // 用户明确提供了input字段
        if (paramDef) {
          // 有参数定义，按定义格式化
          if (paramDef.paramType === 'string' && typeof options.input === 'string') {
            // 字符串参数直接使用
            inputParams = { [paramDef.paramName]: options.input };
          } else if (paramDef.paramType === 'object' && typeof options.input === 'object') {
            // 对象参数，可以进行字段验证
            inputParams = options.input;
            
            // 检查必填字段 (如果定义了fields)
            if (paramDef.fields) {
              Object.keys(paramDef.fields).forEach(field => {
                if (paramDef.fields[field].required && inputParams[field] === undefined) {
                  console.warn(`[CozeSdk] 警告: 工作流[${workflowId}]缺少必填字段: ${field}`);
                }
              });
            }
          } else {
            // 类型不匹配，尝试适配
            console.warn(`[CozeSdk] 警告: 工作流期望${paramDef.paramType}类型参数，但传入的是${typeof options.input}类型`);
            if (typeof options.input === 'string') {
              inputParams = { [paramDef.paramName || 'input']: options.input };
            } else {
              inputParams = options.input;
            }
          }
        } else {
          // 没有参数定义，直接使用input
          inputParams = options.input;
        }
      } else {
        // 检查options本身是否包含input之外的参数，可能用户直接传入了参数对象
        const optionsCopy = { ...options };
        delete optionsCopy.workflowId;
        delete optionsCopy.timeout;
        
        // 如果还有其他参数，则视为输入参数
        if (Object.keys(optionsCopy).length > 0) {
          inputParams = optionsCopy;
        } else {
          inputParams = {};
        }
      }
      
      // 构建最终参数
      params = {
        workflow_id: workflowId,
        parameters: inputParams,
        timeout: options.timeout || config.API_CONFIG.TIMEOUT
      };
      
      console.log('[CozeSdk] 调用工作流(对象输入):', workflowId, '参数:', JSON.stringify(inputParams));
    } 
    // 无效参数
    else {
      throw new Error('参数无效: 必须是字符串或对象');
    }
    
    // 调用工作流
    const result = await workflow.callWorkflow(params);
    
    // 解析处理响应
    return workflow.parseWorkflowResponse(result);
  } catch (error) {
    console.error('[CozeSdk] 工作流调用失败:', error);
    return {
      success: false,
      error: error.message || '未知错误'
    };
  }
}

/**
 * 验证SDK配置
 * 测试是否可以成功获取Access Token和工作流参数定义
 * 
 * @returns {Promise<Object>} 验证结果 {success, message, error}
 */
async function validateConfig() {
  try {
    console.log('[CozeSdk] 开始验证SDK配置...');
    
    // 1. 检查基础配置
    if (!config.APP_CONFIG.APP_ID) throw new Error('未配置APP_ID');
    if (!config.APP_CONFIG.KID) throw new Error('未配置KID');
    if (!config.APP_CONFIG.PRIVATE_KEY_URL) throw new Error('未配置PRIVATE_KEY_URL');
    if (!config.WORKFLOW_IDS.MAIN_WORKFLOW) throw new Error('未配置主工作流ID (MAIN_WORKFLOW)');
    
    console.log('[CozeSdk] 基础配置验证通过');
    
    // 2. 检查工作流参数定义
    const mainWorkflowId = config.WORKFLOW_IDS.MAIN_WORKFLOW;
    const mainWorkflowParams = config.WORKFLOW_PARAMS[mainWorkflowId];
    
    if (mainWorkflowParams) {
      console.log('[CozeSdk] 主工作流参数定义:', {
        workflowId: mainWorkflowId,
        paramType: mainWorkflowParams.paramType,
        paramName: mainWorkflowParams.paramName
      });
    } else {
      console.warn('[CozeSdk] 警告: 未找到主工作流的参数定义，将使用默认参数名input');
    }
    
    // 3. 尝试获取私钥
    const privateKey = await oauth.fetchPrivateKey();
    console.log('[CozeSdk] 私钥获取成功，长度:', privateKey.length);
    
    // 4. 尝试生成JWT
    const jwt = await oauth.generateJWT();
    console.log('[CozeSdk] JWT生成成功，长度:', jwt.length);
    
    // 5. 尝试获取Access Token
    const token = await oauth.getAuthToken();
    console.log('[CozeSdk] Access Token获取成功，长度:', token.length);
    
    return {
      success: true,
      message: '配置验证成功，SDK可以正常使用'
    };
  } catch (error) {
    console.error('[CozeSdk] 配置验证失败:', error);
    return {
      success: false,
      error: error.message || '未知错误'
    };
  }
}

// 创建SDK对象
const CozeSdk = {
  // 公开接口 - 用户可以直接调用
  initialize,
  callWorkflow,
  validateConfig,
  
  // 配置访问 - 只读
  get config() {
    return { ...config };
  },
  
  // 内部模块 - 高级用户使用
  _internal: {
    oauth,
    workflow
  }
};

// 导出SDK
module.exports = CozeSdk; 