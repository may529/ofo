'use strict';
require('styles//NavBar.less');

import React from 'react';
import Config from 'config';
import {Menu, Dropdown, Row, Form, Icon, Modal, Tag, message} from 'antd';
import ModifyForm from './ui/ModifyFormComponent';
import SS  from 'parsec-ss';
import LS  from 'parsec-ls';
import requset from '../Request';

let mycos_logo = require('images//logo.png');

class NavBarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},  //获取的数据
      loading: false, //是否加载状态
      formTitle: '', //表单标题
      formColumns: [],//表单列
      modifyShowType: 'hide'  //编辑表单的显示状态 hide add modify
    };
    this.loadData = this.loadData.bind(this);
    this.handleVerifyEmail = this.handleVerifyEmail.bind(this);
  }

  handleSubmit() {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        return;
      }
      if (this.state.formTitle == '个人资料') {
        this.editTeacherInfo(values);
      } else {
        this.editTeacherPwd(values);
      }
    });
  }

  //修改个人资料
  editTeacherInfo(values) {
    var params = values;
    requset({
      type: 'post',
      url: Config.host + '/custom/user',
      data: params,
      success: (data)=> {
        message.success(data.result);
        this.loadData();
      }
    });
  }


  //修改密码
  editTeacherPwd(values) {
    var params = values;
    requset({
      type: 'post',
      url: Config.host + '/api/admin/common/modify-pass',
      data: {
        newPass: params.newPass,
        oldPass: params.oldPass
      },
      success: ()=> {
        this.setState({
          modifyShowType: 'hide'
        });
        Modal.success({
          title: '密码修改成功',
          content: '您的新密码为:' + params.newPass,
          onOk() {
            SS.clear();
            LS.clear();
            window.location.href = '#/login';
          }
        });
      }
    })
  }

  handleFormChange(props, fields) {
    Console.log(props, fields);
  }

  loadData() {
    // requset({
    //   type: 'get',
    //   url: Config.host + '/custom/user',
    //   data: {},
    //   success: (data)=> {
    //     this.setState({
    //       data: data.result
    //     }, ()=> {
    //       this.props.form.setFieldsValue(data.result);
    //     });
    //   }
    // });
  }

  loginOut() {
    Modal.confirm({
      title: '您是否确认要退出系统',
      content: '',
      onOk() {
        SS.clear();
        LS.clear();
        window.location.href = '#/login';
      },
      onCancel() {
      }
    });
  }

  componentWillMount() {
    this.loadData();
  }

  //邮箱验证
  handleVerifyEmail(email) {
    Modal.confirm({
      title: '邮箱绑定',
      content: '邮箱绑定后，你可以通过该邮箱找回密码。',
      onOk: () => {
        requset({
          type: 'get',
          url: Config.host + '/custom/email/send-url',
          data: {
            email: email
          },
          success: (data)=> {
            console.log(data);
            Modal.success({
              title: '邮件发送成功',
              content: '激活链接已发送至你的邮箱，请点击邮件中的链接进行邮箱绑定。',
            });
          }
        });
      },
      onCancel: () => {
      },
    });
  }


  getPwdColumns() {
    return ([{
      title: '原密码',
      dataIndex: 'oldPass',
      dataType: 'password',
      validata: new RegExp(Config.validateRegExp.password), //本地正则验证
      editable: true,
      validataMsgs: {
        tips: '',  //选中输入框时的提示信息
        errorMsg: '请输入6至18位密码'
      }
    }, {
      title: '新密码',
      dataIndex: 'newPass',
      dataType: 'password',
      editable: true,
      validata: new RegExp(Config.validateRegExp.password), //本地正则验证
      reBind: 'password2',
      validataMsgs: {
        tips: '',  //选中输入框时的提示信息
        errorMsg: '请输入6至18位密码',
        reBindError: '两次输入密码不一致'
      }
    }, {
      title: '确认密码',
      dataIndex: 'password2',
      dataType: 'password',
      editable: true,
      validata: new RegExp(Config.validateRegExp.password), //本地正则验证
      bindValidata: 'newPass',  //绑定字段(和某值相同,常用用于确认输入)
      validataMsgs: {
        tips: '',  //选中输入框时的提示信息
        errorMsg: '两次输入密码不一致'
      }
    }]);
  }

  getUserColumns() {
    return ([
      {
        dataIndex: 'id',
        dataType: 'hidden',
        editable: true,
        showable: false,
      }, {
        dataIndex: 'isValidEmail',
        dataType: 'hidden',
        editable: true,
        showable: false,
      }, {
        title: '登录名',
        dataIndex: 'loginName',
        dataType: 'text',
        editable: true,
        disabled: true,
        validata: new RegExp(Config.validateRegExp.username), //本地正则验证
        //remoteValidata:'http://www.qq.com?value=', //远程服务器验证
        validataMsgs: {
          tips: '',  //选中输入框时的提示信息
          errorMsg: ''
        }
      }, {
        title: '工号',
        dataIndex: 'jobNumber',
        dataType: 'text',
        editable: true,
        disabled: true
      }, {
        title: '姓名',
        dataIndex: 'userName',
        dataType: 'text',
        editable: true,
        disabled: false,
        validata: new RegExp(Config.validateRegExp.realname), //本地正则验证
        validataMsgs: {
          tips: '',  //选中输入框时的提示信息
          errorMsg: '请输入您的姓名'
        }
      }, {
        title: '部门',
        dataIndex: 'department',
        dataType: 'text',
        editable: true,
        disabled: false,
        // validata: new RegExp(Config.validateRegExp.deptname), //本地正则验证
        // //remoteValidata:'http://www.qq.com?value=', //远程服务器验证
        // validataMsgs: {
        //   tips: '',  //选中输入框时的提示信息
        //   errorMsg: '请输入你所在的部门名称'
        // }
      }, {
        title: '职务',
        dataIndex: 'job',
        dataType: 'text',
        editable: true,
        disabled: false,
        // validata: new RegExp(Config.validateRegExp.deptname), //本地正则验证
        // //remoteValidata:'http://www.qq.com?value=', //远程服务器验证
        // validataMsgs: {
        //   tips: '',  //选中输入框时的提示信息
        //   errorMsg: '请输入你的职务'
        // }
      }, {
        title: '手机号',
        dataIndex: 'phone',
        dataType: 'text',
        editable: true,
        disabled: false,
        validata: new RegExp(Config.validateRegExp.tel_mobile), //本地正则验证
        // //remoteValidata:'http://www.qq.com?value=', //远程服务器验证
        validataMsgs: {
          tips: '',  //选中输入框时的提示信息
          errorMsg: '请输入正确的手机号码'
        },
      }, {
        title: '邮箱',
        dataIndex: 'email',
        dataType: 'text',
        editable: true,
        disabled: false,
        isVisibleL: true,
        tips: (record)=> {
          if (record.isValidEmail === 0) {
            return (<label htmlFor=''><a href="javascript:void(0)" onClick={()=> {
              this.handleVerifyEmail(record.email)
            }}>立即绑定</a></label>);
          } else {
            return (<label htmlFor=''><Tag closable={false} color='#108ee9'>已验证</Tag></label>);
          }
        },
        validata: new RegExp(Config.validateRegExp.email), //本地正则验证
        //remoteValidata:'http://www.qq.com?value=', //远程服务器验证
        validataMsgs: {
          tips: '',  //选中输入框时的提示信息
          errorMsg: '请输入正确的邮箱地址'
        }
      }]);
  }

  render() {

    return (
      <Row>
        <Row>
          <div className='navbar-component'>
            <div className='nav-logo'><img className='logo' src={mycos_logo} alt='ofo专题活动管理系统' height='45px'/></div>
            <span className="school-name">{this.state.data.schoolName ? this.state.data.schoolName : ''}</span>
            <div className='nav-user'>
              <Dropdown
                getPopupContainer={()=>document.querySelector('.nav-user')}
                overlay={(
                  <Menu className='nav-dropdown-menu'>
                    <Menu.Item><a onClick={()=>{this.setState({modifyShowType:'modify',formTitle:'修改密码',formColumns:this.getPwdColumns()});}}><Icon type='lock' />修改密码</a></Menu.Item>
                    <Menu.Divider />
                    <Menu.Item><a target='_blank' onClick={this.loginOut.bind(this)}><Icon
                      type='logout'/>注销</a></Menu.Item>
                  </Menu>
                )}>
                <span className='ant-dropdown-link'>
                  <span>欢迎您,</span>
                  <span>&nbsp;&nbsp;{this.state.data == null ? '' : this.state.data.userName}</span> <Icon type='down'/>
                </span>
              </Dropdown>
            </div>
          </div>
        </Row>
        <Row>
          <Modal title={this.state.formTitle}
                 visible={this.state.modifyShowType != 'hide'}
                 onCancel={()=> {
                   this.setState({modifyShowType: 'hide'});
                 }}
                 onOk={this.handleSubmit.bind(this)}>
            {this.state.modifyShowType == 'hide' ||
            <ModifyForm data={this.state.data} columns={this.state.formColumns} form={this.props.form}/>}
          </Modal>

        </Row>
      </Row>


    );
  }
}

NavBarComponent.displayName = 'NavBarComponent';
NavBarComponent = Form.create()(NavBarComponent);

// Uncomment properties you need
// NavBarComponent.propTypes = {};
// NavBarComponent.defaultProps = {};

export default NavBarComponent;
