'use strict';

import React from 'react';
import { Row, Col } from 'antd';
import { Form, Input, InputNumber, DatePicker, Checkbox, Select, Radio } from 'antd';
import InputSelect from './InputSelectComponent';
import InputUpload from './InputUploadComponent';
import InputTransfer from './InputTransferComponent';
import RichTextEditor from './RichTextEditorComponent';
import Cascader from './CascaderComponent';
import Tags from './TagsComponent';
import request from '../../Request';

require('styles/ui/ModifyForm.less');

class ModifyFormComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  componentWillMount() {
  }

  validata(v, value) {
    // console.log(v, value);
    if (v.test) {
      return v.test(value);
    } else if (typeof v === 'function') {
      return v(value);
    }
    return false;
  }

  //表单验证
  handleValidata(rule, value = '', callback, source, options, item) {
    const form = this.props.form;
    //console.log('handleValidata:', item.dataIndex, '-', value);
    //正则验证
    if (item.validata) {
      //如果有过个条件
      if (item.validata instanceof Array) {
        let flag = false;
        for (let i = 0; i < item.validata.length; i++) {
          flag = this.validata(item.validata[i], value);
        }
        if (flag) {
          callback();
        } else {
          callback([new Error(item.validataMsgs.errorMsg)]);
        }
      } else {
        console.log(item.validataEmpty);
        if(item.validataEmpty !=  false){
          if (item.validata && (value == undefined || value.toString().length == 0)) {
            callback([new Error(item.validataMsgs.emptyMsg || '请输入' + item.title)]);
            return;
          }
        }

        if (!this.validata(item.validata, value)) {
          //console.log(item.validata,value);
          callback([new Error(item.validataMsgs.errorMsg)]);
          return;
        }
      }
    }
    //绑定验证
    if (item.bindValidata && form.getFieldValue(item.bindValidata) != value) {
      callback([new Error(item.validataMsgs.errorMsg)]);
      return;
    }
    let reBindValue = form.getFieldValue(item.reBind);
    if (reBindValue != undefined && reBindValue != null && item.reBind && reBindValue != value) {
      let obj = {};
      obj[item.reBind] = {
        value: form.getFieldValue(item.reBind),
        errors: [{
          field: item.reBind,
          message: item.validataMsgs.reBindError,
        }]
      };
      this.props.form.setFields(obj);
    }
    //远程服务器验证
    if (item.remoteValidata) {
      request({
        type: 'get',
        url: item.remoteValidata,
        data: {},
        success: () => {
          callback([new Error('用户名已经存在')]);
        },
        error: () => {
          if (value != 'fuchuan') {
            callback();
          } else {
            callback([new Error('用户名已经存在')]);
          }
        }
      });
    } else {
      callback();
    }
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    let values = this.props.form.getFieldsValue();

    if (!!this.props.instance && !!values.id) {
      values = Object.assign({}, this.props.instance.state.modifyRow, values);
    }

    //表单项统一样式
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    };

    //过滤可编辑项并按类型创建输入框
    this.props.columns.map((item) => {
      item.key = item.dataIndex;
    });

    let formItem = this.props.columns.filter((item) => {
      if (typeof item.editable == 'function') {
        return item.editable(values || this.props.instance.state.modifyRow);
      } else {
        return item.editable;
      }
    }).map((item) => {
      let input;
      //FIX 修复别名没有初始化值
      if (!!item.dataIndexAlia) {
        getFieldDecorator(item.dataIndexAlia);
      }

      //是否禁用
      let disabled = false;
      if (!!values && values.id != null && values.id != undefined) {
        if (typeof item.disabled == 'function') {
          // debugger;
          disabled = item.disabled(values,this.props.form);
        } else {
          disabled = !!item.disabled;
        }
      }


      switch (item.dataType) {
        case 'hidden':
          return (
            getFieldDecorator(item.dataIndex, {
              rules: [
                // { required: true },
                {
                  validator: (rule, value, callback, source, options) => {
                    this.handleValidata = this.handleValidata.bind(this);
                    this.handleValidata(rule, value, callback, source, options, item);
                  }
                }
              ],
              onChange: () => {
                this.setState({ refresh: true });
              },
              initialValue: item.defaultValue
            })(<Input type='hidden' disabled={disabled} autoComplete='off' key={item.dataIndex} placeholder={item.placeholder || item.title} />)
          );
          break;
        case 'text':
          input = (
            <Input type='text' disabled={disabled} autoComplete='off' placeholder={item.placeholder || item.title} />);
          break;
        case 'password':
          input = (
            <Input type='password' disabled={disabled} autoComplete='off' placeholder={item.placeholder || item.title} />);
          break;
        case 'number':
          input = (<InputNumber disabled={disabled} autoComplete='off' placeholder={item.placeholder || item.title} />);
          break;
        case 'email':
          input = (
            <Input type='email' disabled={disabled} autoComplete='off'
                   placeholder={item.placeholder || item.title} />);
          break;
        case 'date':
          input = (<DatePicker disabled={disabled} format={item.format} />);
          break;
        case 'checkbox':
          input = ((item.chlidOptions || []).map((option) => {
            return (<label className='ant-checkbox-inline' key={option.value}><Checkbox disabled={disabled} value={option.value} />{option.text}
            </label>)
          }));
          break;
        case 'radio':
          let radio = ((item.chlidOptions || []).map((option) => {
            return (<Radio key={option.value} value={option.value}>{option.text}</Radio>)
          }));
          input = (<Radio.Group disabled={disabled}>{radio}</Radio.Group>);
          break;
        case 'select':
          let option = ((
            item.chlidOptionsFilter?item.chlidOptionsFilter(item.chlidOptions,values || this.props.instance.state.modifyRow):(item.chlidOptions || [])).map((option) => {
            return (<Select.Option key={option.value} value={option.value}>{option.text}</Select.Option>)
          }));
          input = (<Select disabled={disabled}>{option}</Select>);
          break;
        case 'inputSelect':
          input = (<InputSelect item={item} disabled={disabled} />);
          break;
        case 'inputUpload':
          input = (<InputUpload item={item} form={this.props.form} disabled={disabled} />);
          break;
        case 'transfer':
          input = (<InputTransfer item={item} form={this.props.form} disabled={disabled} />);
          break;
        case 'textarea':
          input = (
            <Input type='textarea' autoComplete='off' disabled={disabled} autosize={{ minRows: 6 }} placeholder={item.placeholder || item.title} />);
          break;
        case 'richtext':
          input = (<RichTextEditor item={item} height='200' form={this.props.form} disabled={disabled} />);
          break;
        case 'tags':
          input = (<Tags item={item} height='200' form={this.props.form} disabled={disabled} />);
          break;
        case 'cascader':
          item.chlidOptionsType.forEach((type) => {
            this.props.form.getFieldProps(type);
          });
          input = (<Cascader item={item} form={this.props.form} disabled={disabled} />);
          break;
        default:
      }
      let tips = item.tips;
      if (typeof item.tips == 'function') {
        tips = item.tips(values);
      }
      return (
        <Form.Item {...formItemLayout} label={item.title } key={item.dataIndex} hasFeedback={!!item.validata}>
          {
            getFieldDecorator(item.dataIndex, {
              rules: [
                // { required: true },
                {
                  validator: (rule, value, callback, source, options) => {
                    this.handleValidata = this.handleValidata.bind(this);
                    this.handleValidata(rule, value, callback, source, options, item);
                  }
                }
              ],
              onChange: () => {
                this.setState({ refresh: true });
              },
              initialValue: item.defaultValue
            })(input)
          }
          <span className='tips'>{tips}</span>
        </Form.Item>
      );
    });
    let formItemExt = (this.props.extColumns || []).map((item) => {
      return (
        <item.component form={this.props.form} item={item} key={item.key} />
      )
    });

    let tips = this.props.tips || {};
    let showable = !!tips.showable;
    if (typeof tips.showable == 'function') {
      showable = tips.showable(values || this.props.instance.state.modifyRow);
    }

    return (
      <Row>
        {showable &&
          <Row>
            <Col span={24} style={{
              textAlign: 'center',
              marginBottom: '10px'
            }}>{this.props.tips.text}</Col>
          </Row>}
        <Row>
          <Form horizontal onSubmit={this.handleSubmit.bind(this)}>
            {formItem}
            {formItemExt}
          </Form>
        </Row>
      </Row>
    );
  }
}

ModifyFormComponent.displayName = 'UiModifyFormComponent';

// Uncomment properties you need
// ModifyFormComponent.propTypes = {};
// ModifyFormComponent.defaultProps = {};

export default ModifyFormComponent;
