const apollo = require('./libs/napollo')
const Config = require('./config')

// 主运行函数
main(apollo, Config);


// main函数
function main(apollo, Config) {

  // 第一次通过不带缓存的Http接口从Apollo读取配置
  apollo.remoteConfigServiceSikpCache(Config.remoteConfig)
  .then(
    (bundle) => { 
      // 写入本地配置文件，该文件在项目根目录下
      apollo.createEnvFile(bundle);

      // 注入process.env中
      apollo.setEnv();

      // 开启长连接监控变化
      longPool(Config);
    } 
  )
  .catch(err => {
    console.log('第一次通过不带缓存的Http接口从Apollo读取配置时出错！');
    console.error(err);
  });
}

// 长连接函数
function longPool(config) {
  // 开启长连接
  apollo.RemoteConfigLongPollService(Object.assign({}, config.LongPollServiceConfig, {notifications: Object.values(config.LongPollServiceConfig.notifications)}))
  .then((res) => {
    // 如果返回状态为304，代表没有配置项改变，继续递归执行长连接函数
    if (res.status && res.status == 304) {
      longPool(config);
    }
    // 如果返回状态码为200，代表有配置项改变，则改变请求参数，递归执行main函数
    else if (res.status && res.status == 200) {
      // 改变请求参数notificationId
      res.data.forEach((item, index) => {
        // 更新notificationId
        config.LongPollServiceConfig.notifications[item.namespaceName].notificationId = item.notificationId;
      })
      // 重新执行main函数
      main(apollo, config);
    }
    // 其他状态码, 直接重新请求
    else {
      console.error('请求出现未知错误，状态码为：', res.status);
      console.error('已重启本程序！');
      main(apollo, Config);
    }
  })
  .catch((err) => {
    console.log('长连接函数内出错！');
    console.log(err);
  });
}
