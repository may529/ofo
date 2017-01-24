'use strict';

import React from 'react';
import { Cascader  } from 'antd';

require('styles//ui/Cascader.less');

class CascaderComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      defaultValue:null
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(value, selectedOptions){
    // console.log(value, selectedOptions);
    let values =  this.props.form.getFieldsValue();
    this.props.item.chlidOptionsType.forEach((type,index)=>{
      values[type] = value[index];
    });
    this.props.form.setFieldsValue(values);
    // console.log(this.props.form.getFieldsValue());
  }
  doProps(props){
    let value = [];
    let values =  props.form.getFieldsValue();
    let item = props.item;
    // console.log('doProps',values);
    item.chlidOptionsType.forEach((type)=>{
      if(!!values[type]){
        value.push(values[type]);
      }
    });
    this.setState({
      defaultValue:value
    });
  }
  componentWillMount(){
    this.doProps(this.props);
  }
  componentWillReceiveProps(nextProps){
    this.doProps(nextProps);
  }
  render() {
    let item = this.props.item;
    return (
      <div className="cascader-component">
        {!!this.state.defaultValue&&
        <Cascader
          value={this.state.defaultValue}
          options={item.chlidOptions}
          placeholder={item.title}
          onChange={this.handleChange}
          changeOnSelect={this.props.changeOnSelect}
        />
        }
      </div>
    );
  }
}

CascaderComponent.displayName = 'UiCascaderComponent';

// Uncomment properties you need
// CascaderComponent.propTypes = {};
// CascaderComponent.defaultProps = {};

export default CascaderComponent;
