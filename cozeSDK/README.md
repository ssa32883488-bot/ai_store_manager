# 扣子工作流 SDK

一个用于微信小程序调用扣子工作流的轻量级SDK，基于OAuth认证机制，简化工作流的集成与调用。

## 特点

- **简单配置**：只需在config.js中配置必要参数
- **安全可靠**：基于OAuth认证，自动处理token生成与刷新
- **参数智能识别**：根据工作流定义自动格式化参数
- **健壮错误处理**：详细的错误信息和日志，便于排查问题
- **零侵入集成**：无需修改现有代码，即插即用

## 快速开始

### 1. 复制SDK到项目

将`cozeSDK`文件夹复制到您的微信小程序项目中，SDK包含以下核心文件：

- `config.js` - 配置文件，包含所有需要自定义的参数
- `index.js` - SDK主入口
- `oauth.js` - OAuth认证模块
- `workflow.js` - 工作流调用模块
- `cloudFunctions/generateJWT` - 用于生成JWT的云函数

### 2. 部署云函数

1. 在微信开发者工具中，打开项目
2. 确保已开通云开发功能
3. 右键点击`cozeSDK/cloudFunctions/generateJWT`文件夹
4. 选择"上传并部署：云端安装依赖"
5. 等待部署完成

### 3. 配置SDK

编辑`cozeSDK/config.js`文件，填入您的配置信息：

```javascript
// 微信云开发环境ID(必填)
const CLOUD_ENV_ID = "your-cloud-env-id"; // 修改为您的云环境ID

// 应用认证配置(必填)
const APP_CONFIG = {
  // Coze OAuth应用ID(必填)
  APP_ID: "your-app-id", // 修改为您的应用ID
  
  // 公钥指纹，用于JWT header的kid字段(必填)
  KID: "your-kid-fingerprint", // 修改为您的公钥指纹
  
  // 私钥存储地址(必填)
  PRIVATE_KEY_URL: "your-private-key-url" // 修改为您的私钥存储地址
};

// 工作流配置(必填)
const WORKFLOW_IDS = {
  // 主要工作流ID，用于默认调用
  MAIN_WORKFLOW: "your-workflow-id" // 修改为您的工作流ID
};

// 工作流参数定义
const WORKFLOW_PARAMS = {
  // 为每个工作流定义所需参数格式
  "your-workflow-id": {
    paramType: "string", // 参数类型：string或object
    paramName: "input",  // 参数名称
    description: "文本输入参数"
  }
};
```

### 4. 配置项目文件

确保项目的`project.config.json`文件中包含云函数目录配置：

```json
{
  "cloudfunctionRoot": "cozeSDK/cloudFunctions/",
  ...
}
```

### 5. 使用SDK

在您的页面JS文件中：

```javascript
// 导入SDK
const CozeSdk = require('../../cozeSDK/index');

// 初始化SDK
CozeSdk.initialize();

// 在页面加载时验证配置
Page({
  onLoad: async function() {
    // 验证SDK配置
    const validation = await CozeSdk.validateConfig();
    if (validation.success) {
      console.log('SDK配置正确，可以使用');
    } else {
      console.error('SDK配置错误:', validation.error);
    }
  },
  
  // 调用工作流示例
  callWorkflowExample: async function() {
    try {
      // 简单方式调用
      const result = await CozeSdk.callWorkflow("你好，请问今天天气如何？");
      
      if (result.success) {
        console.log('工作流返回:', result.data);
        // 在界面上显示结果
        this.setData({ response: result.data });
      } else {
        console.error('调用失败:', result.error);
      }
    } catch (error) {
      console.error('发生错误:', error);
    }
  }
});
```

## 调用方式

SDK支持多种调用工作流的方式，适应不同的使用场景：

### 简单调用 - 直接传入字符串

适用于只需要一个文本输入的工作流：

```javascript
// 直接传入字符串，将使用默认工作流(MAIN_WORKFLOW)
const result = await CozeSdk.callWorkflow("你好，请问今天天气如何？");
```

### 对象调用 - 指定输入参数

适用于需要传递结构化参数的情况：

```javascript
// 使用input字段包装输入
const result = await CozeSdk.callWorkflow({
  input: "你好，请问今天天气如何？"
});
```

### 完整调用 - 指定工作流和参数

适用于需要调用非默认工作流或传递复杂参数的场景：

```javascript
// 完整参数形式
const result = await CozeSdk.callWorkflow({
  workflowId: "7490025887242747916", // 指定工作流ID
  input: {                           // 复杂参数对象
    user_id: "12345",
    query: "如何使用扣子工作流？",
    context: ["上一次的对话内容"]
  },
  timeout: 60000                     // 自定义超时时间(毫秒)
});
```

## 工作流参数定义

为了确保正确调用工作流，您可以在`config.js`中定义每个工作流所需的参数格式：

### 字符串参数工作流

```javascript
"your-workflow-id": {
  paramType: "string",
  paramName: "input",
  description: "简单文本输入"
}
```

### 对象参数工作流

```javascript
"your-workflow-id": {
  paramType: "object",
  description: "复杂结构化参数",
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
```

## 错误处理

SDK提供详细的错误信息，便于排查问题：

```javascript
try {
  const result = await CozeSdk.callWorkflow("你好");
  
  if (!result.success) {
    // 处理业务逻辑错误
    console.error('调用失败:', result.error);
  }
} catch (error) {
  // 处理SDK异常
  console.error('SDK异常:', error);
}
```

## 常见问题

### 1. 无法获取私钥

```
错误: Cannot read property 'content' of undefined
```

解决方案:
- 检查`PRIVATE_KEY_URL`是否正确
- 确保私钥URL可以公开访问
- 检查返回的私钥格式是否正确（PEM格式）

### 2. 云函数调用失败

```
错误: 云函数 generateJWT 调用失败
```

解决方案:
- 确保云函数已正确部署
- 检查`CLOUD_ENV_ID`是否正确
- 在云开发控制台查看云函数日志

### 3. 工作流调用失败

```
错误: 工作流调用失败: 响应状态码非200
```

解决方案:
- 确认`APP_ID`和`KID`是否正确
- 检查工作流ID是否存在且有访问权限
- 确认参数格式是否符合工作流要求

## API参考

### CozeSdk.initialize()

初始化SDK，自动读取config.js中的配置。

```javascript
CozeSdk.initialize();
```

### CozeSdk.validateConfig()

验证SDK配置是否正确。

```javascript
const result = await CozeSdk.validateConfig();
// 返回: {success: true/false, message: '成功信息', error: '错误信息'}
```

### CozeSdk.callWorkflow(options)

调用工作流，返回处理结果。

```javascript
const result = await CozeSdk.callWorkflow(options);
// 返回: {success: true/false, data: {结果数据}, error: '错误信息'}
```

## 许可证

MIT 