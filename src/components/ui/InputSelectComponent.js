'use strict';
require('styles/ui/InputSelect.less');

import React from 'react';
import {Select, Modal, message, Col, Row, Button, Icon} from 'antd';
import {Form, Input, Table} from 'antd';
import request from '../../Request';

class InputSelectComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addModalShow: false,
      addLoding: false,
      data: []
    };
    this.handleDel = this.handleDel.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
  }

  loadData() {
    let item = this.props.item;
    request({
      type: 'get',
      url: item.chlidOptionsUrl,
      success: (data) => {
        if (data.status != 0) {
          message.error(data.message);
          return;
        }
        let dataRaw = (data.list || data.lst || data.array);
        let dataDest = dataRaw.map((it) => {
          return {
            key: it.id,
            value: it[item.chlidOptionsType.value],
            text: it[item.chlidOptionsType.text]
          };
        });
        this.props.form.resetFields();
        this.setState({
          data: dataDest
        });
      }
    });
  }

  saveData(obj) {
    this.setState({addLoding: true});
    let item = this.props.item;
    request({
      type: 'post',
      url: item.chlidOptionsSaveUrl || item.chlidOptionsUrl,
      data:obj,
      success: (data) => {
        this.setState({addLoding: false});
        if (data.status != 0) {
          message.error(data.msg);
          return;
        }
        message.success('添加成功');
        this.loadData();
      }
    });
  }

  delData(id) {
    this.setState({addLoding: true});
    let item = this.props.item;
    request({
      type: 'delete',
      url:  item.chlidOptionsDelUrl + '?id=' + id,
      data:obj,
      success: (data) => {
        this.setState({addLoding: false});
        if (data.status != 0) {
          message.error(data.msg);
          return;
        }
        message.success('删除成功');
        this.loadData();
      }
    });
  }

  componentWillMount() {
    //console.log('componentWillMount-InputSelectComponent');
    this.loadData();
  }

  handleSelect(value, option) {
    //console.log('InputSelectComponent-handleSelect',value,option);
    //return false;
  }

  handleAdd(e) {
//    console.log(1111);
    e.stopPropagation();
    e.preventDefault();
    let item = this.props.item;
    let obj = {};
    obj[item.dataIndexAlia] = this.props.form.getFieldsValue()['value'];
    let value = this.props.form.getFieldsValue()['value'];
//    console.log(item);
    if (item.validata) {
      let items = item.validata;
      if (!(item.validata instanceof Array)) {
        items = [item.validata];
      }
      for (let v of items) {
        if (value == undefined || !v.test(value)) {
          // console.log(v,value);
          message.error(item.validataMsgs.tips);
          return;
        }
      }
    }

    this.saveData(obj);
  }

  handleDel(id) {
//    console.log(122222);
    this.delData(id);
  }

  render() {
    //console.log('render-InputSelectComponent');
    const {getFieldProps} = this.props.form;
    const showOption = this.state.data.map((item) => {
      return (
        <Select.Option value={item.value} key={item.value}>{item.text}</Select.Option>
      );
    });
    const item = this.props.item;
    const columns = [{
      title: 'text',
      dataIndex: 'text',
      key: 2
    }];

    if (!!item.chlidOptionsDelUrl) {
      columns.push({
        title: 'value',
        dataIndex: 'value',
        key: 3,
        render: (text, record) => {
          return (
            <Icon type="cross" style={{cursor: 'pointer'}} onClick={() => {
              this.handleDel(text);
            }}/>
          );
        }
      });
    }
    return (
      <Row className='inputselect-component'>
        <Row>
          <Col span={19}>
            <Select {...this.props} onSelect={this.handleSelect.bind(this)} notFoundContent='暂无数据' allowClear={true}>
              {showOption}
            </Select>
          </Col>
          <Col span={4}>
            <Button style={{marginLeft: 10}} onClick={() => {
              this.setState({addModalShow: true});
              this.props.form.resetFields();
            }}><Icon type='plus'/></Button>
          </Col>
        </Row>
        <Row>
          <Modal title='添加'
                 visible={this.state.addModalShow}
                 maskClosable={false}
                 zIndex={99}
                 width={300}
                 footer={''}
                 onCancel={() => {
                   this.setState({addModalShow: false})
                 }}
                 onOk={() => {
                   this.setState({addModalShow: false})
                 }}>
            <Row>
              <Form inline onSubmit={this.handleAdd}>
                <Form.Item>
                  <Input {...getFieldProps('value')} placeholder={item.title} autoComplete='off'/>
                </Form.Item>
                <Button type='primary' htmlType='submit' loading={this.state.addLoding}>添加</Button>
              </Form>
            </Row>
            <Row>
              <Table
                key={Math.random()}
                showHeader={false}
                pagination={false}
                rowKey={record => record.id}
                scroll={{y: 240}}
                columns={columns}
                dataSource={this.state.data}
              />
            </Row>
          </Modal>
        </Row>
      </Row>
    );
  }
}

InputSelectComponent.displayName = 'UiInputSelectComponent';
InputSelectComponent = Form.create()(InputSelectComponent);
// Uncomment properties you need
// InputSelectComponent.propTypes = {};
// InputSelectComponent.defaultProps = {};

export default InputSelectComponent;
