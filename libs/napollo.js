const apollo = require('node-apollo');
const urllib = require('urllib');
const assert = require('assert');
const helper = require('./helper');
const fs = require('fs');
const config = require('../config');

module.exports = Object.assign(apollo, {
  RemoteConfigLongPollService: async (config) => {
    assert(config, 'param config is required');
    assert(config.token, 'param token is required');
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        authorization: config.token,
      },
      rejectUnauthorized: false,
      contentType: 'json',
      dataType: 'json',
      timeout: [1000, 5000 * 60]
    };
    const res = await urllib.request(helper.getLongPollService(config), options);
    return res;
  },
  // 生成default.env
  createEnvFile: (envConfig) => {
    if (fs.existsSync(config.ENV_FILE_PATH)) {
      fs.unlinkSync(config.ENV_FILE_PATH);
    }
    for (let key of Object.keys(envConfig)) {
      fs.appendFileSync(config.ENV_FILE_PATH, `${key}=${envConfig[key]}\n`);
    }
  },

  // 注入到process.env
  setEnv: () => {
    try {
      require('dotenv').config({ path: config.ENV_FILE_PATH });
    } catch(err) {
      assert(false, err);
    }
  }
});

 