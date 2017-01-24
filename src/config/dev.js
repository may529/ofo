'use strict';

import baseConfig from './base';

let config = {
  appEnv: 'dev',  // feel free to remove the appEnv property here
  // host:'http://192.168.65.131:3002',
  host:'https://unicom.parsec.com.cn/test/',
};

export default Object.freeze(Object.assign({}, baseConfig, config));
