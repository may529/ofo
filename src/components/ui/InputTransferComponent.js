'use strict';

import React from 'react';
import {Input, Transfer} from 'antd';
import Request from '../../Request';


require('styles/ui/InputTransfer.less');

class InputTransferComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      targetKeys: [],
      isLoading: false
    };
  }

  componentWillMount() {
    this.loadData();
  }


  loadData() {
    this.setState({
      isLoading: true
    });
    Request({
      type: 'get',
      url: this.props.item.chlidOptionsUrl,
      success: (data) => {
        data = data.result;
        let lst = data.list || [];
        lst.forEach((item,) => {
          item.key = item[this.props.item.chlidOptionsType.value];
          item.title = item[this.props.item.chlidOptionsType.text];
          item.description = item[this.props.item.chlidOptionsType.text];
        });
        //console.table( lst );
        this.setState({
          data: lst,
          targetKeys: this.getTargetKeys(),
          isLoading: false
        });
      }
    });
  }

  getTargetKeys() {
    let values = this.props.form.getFieldsValue();
    let targetKeys = ( values[this.props.item.dataIndex] || []);
    // console.table(targetKeys);
    targetKeys = targetKeys.map((item) => {
      return item[this.props.item.chlidOptionsType.value];
    });
    //console.table(targetKeys);
    if (targetKeys && targetKeys.length) {
      values[this.props.item.dataIndex] = targetKeys;
      this.props.form.setFieldsValue(values);
    }
    return targetKeys;
  }

  handleChange(targetKeys, direction, moveKeys) {
    let values = this.props.form.getFieldsValue();
    values[this.props.item.dataIndex] = targetKeys;
    this.props.form.setFieldsValue(values);
    this.props.form.validateFields([this.props.item.dataIndex]);
    //console.log(values);
    //console.table(targetKeys);
    this.setState({targetKeys});
  }

  render() {
    return (
      <div className="inputtransfer-component">
        <Input type='hidden' {...this.props} />
        <Transfer
          rowKey={record => record.id}
          dataSource={this.state.data}
          targetKeys={this.state.targetKeys}
          onChange={this.handleChange.bind(this)}
          render={item => item.title}/>
      </div>
    );
  }
}

InputTransferComponent.displayName = 'UiInputTransferComponent';

// Uncomment properties you need
// InputTransferComponent.propTypes = {};
// InputTransferComponent.defaultProps = {};

export default InputTransferComponent;
