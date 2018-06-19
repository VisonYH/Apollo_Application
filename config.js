const path = require('path');

// 配置基础项configServerUrl、token、appId、clusterName
const baseConfig =  {
  configServerUrl: 'http://192.168.11.197:8070',
  token: '09af7e6d9776330c876423e7a9fa0d9f6e93b4a9',
  appId: 'engine',
  clusterName: 'default'
}

// 配置namespaceName
const namespaceConfig = ["application", "database", "filesystem"];

// 通过namespaceConfig产生长连接请求参数映射，以方便后续更新notificationId（服务器返回的更新notificationId是个无序数组，这样做是为了更好地找到相应项进行更新）
const CreateNamespaceConfigObj = (function (namespaceConfig) {
  let obj = {};
  namespaceConfig.forEach((item, index) => {
    obj[item] = {
      namespaceName: item,
      notificationId: -1
    }
  } )
  return obj;
})(namespaceConfig)

module.exports = {
  // 本地配置文件路径
  ENV_FILE_PATH: path.join(process.cwd(), '/default.env'),
  // 获取服务配置项
  remoteConfig: Object.assign({}, baseConfig, {
     configServerUrl: 'http://192.168.11.197:8080',
     apolloEnv: 'dev',
     namespaceName: namespaceConfig
  }),

  // 获取长连接配置map
  LongPollServiceConfig: Object.assign({}, baseConfig, {
    configServerUrl: 'http://192.168.11.197:8080',
    notifications: CreateNamespaceConfigObj
  })
};

