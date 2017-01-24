'use strict';

import baseConfig from './base';

let config = {
  appEnv: 'dist',  // feel free to remove the appEnv property here
  // host:window.location.protocol + "//" +window.location.host+'/'
  host:"https://unicom.parsec.com.cn/test/"
};

export default Object.freeze(Object.assign({}, baseConfig, config));
