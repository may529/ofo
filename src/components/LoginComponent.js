'use strict';

require('styles//Login.less');

import React from 'react';
//noinspection NpmUsedModulesInstalled
import Config from 'config';
import SS from 'parsec-ss';
//noinspection JSUnresolvedVariable
import {Form, Input, Button} from 'antd';
import request from '../Request';

let logo = require('images//logo.png');

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgurl: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    this.loadVeryImg();
    this.setState({
      isShow: SS.get(Config.loginOutMsg) == null ? '' : 'msg-warn',
      msg: SS.get(Config.loginOutMsg) == null ? '' : SS.get(Config.loginOutMsg),
      loading: false
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.checkLoginValue()) {
      let values = this.props.form.getFieldsValue();
      this.signIn(values);
    }
  }

  checkLoginValue() {
    let values = this.props.form.getFieldsValue();
    if (!values.username) {
      this.setState({
        isShow: 'msg-warn',
        msg: '请输入登录名'
      });
      return false;
    }
    if (!values.password) {
      this.setState({
        isShow: 'msg-warn',
        msg: '请输入登录密码'
      });
      return false;
    }
    // if (!values.validateCode) {
    //   this.setState({
    //     isShow: 'msg-warn',
    //     msg: '请输入验证码'
    //   });
    //   return false;
    // }
    return true;
  }

  loadVeryImg() {
    let code = parseInt(Math.random() * (99999999 - 10000000 + 1) + 10000000);
    SS.set(Config.randomStr, code);
    this.setState({
      imgurl: Config.host + '/check-code?random=' + code
    });
  }

  signIn(params) {
    params.random = SS.get(Config.randomStr);
    this.setState({
      isShow: '',
      msg: '',
      loading: true
    });

    request({
      type: 'post',
      url: Config.host + '/api/login',
      data: {
        username: params.username,
        password: params.password,
        // validateCode: params.validateCode,
        random: SS.get(Config.randomStr)
      },
      success: (data)=> {
        SS.set(Config.token, data.result.token);
        SS.set(Config.userId, data.result.userId);
        SS.set(Config.roleType, data.result.roleType);
        SS.remove('expireTime');
        window.location.href = '#/?';
      },
      error: (data)=> {
        this.setState({
          isShow: 'msg-error',
          msg: data.message,
          loading: false
        });
        this.loadVeryImg();
      }
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;

    return (
      <div className='login-component'>
        <div className='w'>
          <div id='login'>
            <a href='#'>
              <img src={logo} width='60'/>
            </a>
          </div>
        </div>
        <div id='content'>
          <div className='login-wrap'>
            <div className='w'>
              <div className='login-form'>
                <div className='login-box'>
                  <div className='mt'>
                    <h1>ofo专题活动管理系统</h1>
                    <div className='extra-r'>
                      <div className='regist-link'>
                      </div>
                    </div>
                  </div>
                  <div className='msg-wrap'>
                    {this.state.isShow == 'msg-warn' ?
                      <div className='msg-warn'>
                        <b></b>{this.state.msg}
                      </div>
                      : <div></div>
                    }
                    {this.state.isShow == 'msg-error' ?
                      <div className='msg-error'>
                        <b></b> {this.state.msg}
                      </div>
                      : <div></div>
                    }
                  </div>
                  <div className='mc'>
                    <div className='form'>
                      <Form horizontal onSubmit={this.handleSubmit}>
                        <Form.Item className='login-item'>
                          {getFieldDecorator('username')(
                            <Input type='text' autoComplete='off' placeholder='请输入登录名'/>
                          )}
                        </Form.Item>
                        <Form.Item className='login-item'>
                          {getFieldDecorator('password')(
                            <Input type='password' autoComplete='off' placeholder='请输入密码'/>
                          )}
                        </Form.Item>
                        {/*<Form.Item className='login-item'>*/}
                          {/*{getFieldDecorator('validateCode')(*/}
                            {/*<Input type='text' className='item-verycode' autoComplete='off' placeholder='验证码'/>*/}
                          {/*)}*/}
                          {/*<span><img src={ this.state.imgurl } title='看不清？换一个' className='checkimg' onClick={this.loadVeryImg.bind(this)}/></span>*/}
                        {/*</Form.Item>*/}
                        <Button className='btn btn-primary' loading={this.state.loading} htmlType='submit'
                                type='primary' id='loginBtn'>登 &nbsp;&nbsp;&nbsp;&nbsp;录</Button>
                        <Form.Item className='login-foot'>
                          <a href='#/forgetpwd' id='forget-pwd' title='忘记密码'>忘记密码？</a>
                        </Form.Item>
                      </Form>
                    </div>
                    <div className='coagent'></div>
                  </div>
                </div>
              </div>
            </div>
            <div className='login-banner'>
              <div className='w'>
                <div id='banner-bg' className='i-inner'></div>
              </div>
            </div>
          </div>
        </div>
        <div className='w'>
          <div className='footer'>
            <div className='copyright'>建议您使用IE11、FireFox、Google Chrome、Safari浏览本网站,以获得更好的用户体验</div>
          </div>
        </div>
      </div>
    );
  }
}

LoginComponent.displayName = 'LoginComponent';
LoginComponent = Form.create()(LoginComponent);

// Uncomment properties you need
// LoginComponent.propTypes = {};
// LoginComponent.defaultProps = {};

export default LoginComponent;
