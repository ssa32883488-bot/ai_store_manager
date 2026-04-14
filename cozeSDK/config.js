/**
 * Coze SDK配置文件
 * 
 * 用户只需在本文件中配置相关参数，无需修改SDK其他文件
 * 
 * 版本: 1.0.0
 * 创建日期: 2024-07-11
 */

//===================================================
// 用户需要配置的部分 - 请替换以下值为您自己的配置
//===================================================

// 微信云开发环境ID(必填)
// 用于调用云函数，生成JWT令牌
const CLOUD_ENV_ID = "cloud1-6gmkdpaqcf033ff0"; // 例如: "test-xyz123"

// 应用认证配置(必填)
const APP_CONFIG = {
  // Coze OAuth应用ID(必填)
  APP_ID: "1183244156467", // 例如: "31000000002"
  
  // 公钥指纹，用于JWT header的kid字段(必填)
  KID: "65IGRGFe_5lFwCLDm22xtN0xy6JpJMkz5KmLBr9Rveg", // 例如: "gdehvaDegW...."
  
  // 私钥存储地址(必填)
  // 现在从本地文件读取私钥
  PRIVATE_KEY_URL: "cozeSDK/private_key.pem", // 将私钥文件放到CozeSDK根目录下，本地文件路径 例如: "cozeSDK/private_key.pem"

  // 私钥缓存配置
  PRIVATE_KEY_CACHE: {}
};

// 工作流配置(必填)
// 可配置多个工作流，通过ID区分
const WORKFLOW_IDS = {
  // 主要工作流ID(必填)，用于默认调用
  MAIN_WORKFLOW: "7627795113028485139", // 例如: "7480002912548306953"
  
  // 其他工作流，可根据需要添加更多
  // ANOTHER_WORKFLOW: "另一个工作流ID",
};

// 工作流输入参数定义
// 为每个工作流定义其所需的输入参数格式
const WORKFLOW_PARAMS = {
  // 主工作流参数定义
  "7627795113028485139": {
    paramType: "object",
    description: "极简创作工作流参数（8字段）",
    fields: {
      product_name: {
        type: "string",
        required: true,
        description: "产品名称"
      },
      category: {
        type: "string",
        required: true,
        description: "产品品类"
      },
      original_image: {
        type: "string",
        required: true,
        description: "产品原图URL（已上云）"
      },
      reference: {
        type: "string",
        required: true,
        description: "参考图URL（上传参考图优先；否则预设风格图URL）"
      },
      reference_str: {
        type: "string",
        required: false,
        description: "参考风格文本（上传参考图时可为空）"
      },
      platform: {
        type: "string",
        required: true,
        description: "发布平台"
      },
      copywriting: {
        type: "string",
        required: true,
        description: "文案风格/标题风格"
      },
      user_desc: {
        type: "string",
        required: false,
        description: "用户补充说明"
      }
    }
  },

//多个参数定义方法
/*
"你的工作流id": {
  paramType: "object",
  fields: {
    photo: { //photo是第一个参数名
      type: "string",
      required: true,
      description: "类型参数"
    },
    audioUrl: { //audioUrl是第二个参数名
      type: "string", 
      required: true,
      description: "音频URL"
    }
  },
  description: "包含type和audioUrl两个字符串参数",
  example: "CozeSdk.callWorkflow({ type: 'someType', audioUrl: 'https://example.com/audio.mp3' })"
},
*/
  
  // 可以定义其他工作流的参数结构
  // 示例：需要多个字段的工作流
  /*
  "其他工作流ID": {
    paramType: "object",
    description: "包含多个字段的对象参数",
    example: "CozeSdk.callWorkflow({ input: { user_id: '123', query: '如何使用扣子工作流？' } })",
    fields: {
      user_id: {
        type: "string",
        required: true,
        description: "用户ID"
      },
      query: {
        type: "string",
        required: true,
        description: "用户查询内容"
      },
      context: {
        type: "array",
        required: false,
        description: "聊天上下文"
      }
    }
  }
  */
};

//===================================================
// 高级配置 - 一般情况下不需要修改
//===================================================

// OAuth相关配置
const OAUTH_CONFIG = {
  // OAuth token获取地址
  TOKEN_URL: "https://api.coze.cn/api/permission/oauth2/token",
  
  // 权限范围
  SCOPE: "workflowapi",
  
  // JWT令牌有效期(秒) - 只用于生成JWT时使用，JWT只能使用一次
  JWT_EXPIRES: 3600,
  
  // 云函数名称(用于生成JWT)
  CLOUD_FUNCTION: "generateJWTCoze",
  
  // Token缓存配置
  TOKEN_CACHE: {
    token: null,
    expiresAt: 0
    // 不再使用refreshThreshold，在getAuthToken函数中直接定义
  }
};

// 工作流API配置
const API_CONFIG = {
  // 工作流API调用地址
  API_URL: "https://api.coze.cn/v1/workflow/run",
  
  // 默认请求超时时间(毫秒)
  TIMEOUT: 300000,
  
  // 重试配置
  RETRY: {
    enabled: true,
    maxRetries: 2,
    baseDelay: 1000
  }
};

module.exports = {
  CLOUD_ENV_ID,
  APP_CONFIG,
  OAUTH_CONFIG,
  API_CONFIG,
  WORKFLOW_IDS,
  WORKFLOW_PARAMS
}; 