import { message } from 'antd';
import Config from 'config';
import SS from 'parsec-ss';
import $ from 'jquery';

export default (option) => {

  let error = option.error;
  option.error = (jqXHR, textStatus, errorThrown) => {
    if (!!error) {
      error({ message: textStatus });
    } else {
      switch (jqXHR.status) {
        case (500):
          break;
        case (403):
          break;
        case (400)://非法的数据请求
        case (401):
          SS.clear();
          SS.set(Config.loginOutMsg, '您没有权限访问该资源');
          if (!!SS.get(Config.token)) {
            location.href = '#/login';
          }

          break;
        case (404):
          location.href = '#/errorpage';
          break;
        default:
        //alert('暂时无法连接到服务器');
      }
    }
  };

  let success = option.success;
  option.success = (data) => {
    if (success) {
      if (data.code === 0) {
        success(data);
      } else {
        if (error) {
          error(data);
        } else {
          message.error(data.message);
        }
      }
    }
  };


  Object.assign(option, {
    cache: false,
    beforeSend: function (xhr) {
      xhr.setRequestHeader(Config.token, 'Bearer ' + SS.get(Config.token));

    },
    dataType: 'json',
    contentType: "application/json"
  });

  if (!!option.type && option.type != "get") {
    option.data = JSON.stringify(option.data);
  }

  return $.ajax(option);
};
