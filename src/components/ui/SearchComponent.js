'use strict';

import React from 'react';
import {Button, Col} from 'antd';
import {Form, Input, Select} from 'antd';
import Cascader from './CascaderComponent';

require('styles/ui/Search.less');

// 右侧搜索区域
class SearchComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleCascaderChange = this.handleCascaderChange.bind(this);
  }

  handleChangeSearch() {
//    console.log(arguments);
  }

  handleCascaderChange(value) {
    let values = this.props.form.getFieldsValue();
    this.props.item.chlidOptionsType.forEach((type, index) => {
      values[type] = value[index];
    });
//    console.log(values);
    this.props.form.setFieldsValue(values);
  }

  handleSearch(event) {
    this.loadSearchData();
    event.stopPropagation();
  }

  loadSearchData() {
    let values = this.props.form.getFieldsValue();
    let searcher = {};

    for (let key in values) {
      if (values[key] instanceof Array) {
        values[key] = values[key].join(',');
      }
      if (!values[key] && values[key] !== 0) {
        continue;
      }
      searcher[key] = values[key];

    }
    // console.log(searcher);
    this.props.instance.setState({
      searcher: searcher
    }, () => {
      this.props.instance.reLoad();
    });
  }

  render() {
    const {getFieldProps} = this.props.form;
    //console.log('Searchrender-searchColumns',this.props.searchColumns);
    let searchColumns = this.props.searchColumns.map((item, index) => {
      let input;
      switch (item.searchType || item.dataType) {
        case 'text':
        case 'inputUpload':
          input = (<Input type='text'  {...getFieldProps(item.searchable.name)} disabled={false} autoComplete='off'
                          placeholder={'请输入' + item.title}/>)
          break;
        case 'select':
        case 'radio':
        case 'inputSelect':
          let option = ((item.chlidOptions || []).map((option) => {
            return (<Select.Option key={option.value} value={option.value}
                                   disabled={item.disabled}>{option.text}</Select.Option>)
          }));
          input = (<Select
            multiple={item.multiple} {...getFieldProps(item.searchable.name, {initialValue: item.defaultValue}, {
            onChange: this.handleChangeSearch.bind(this)
          })} style={{width: '150px'}} placeholder={'请选择' + item.title} allowClear={true}>{option}</Select>);
          break;
        case 'cascader':
          item.chlidOptionsType.forEach((type) => {
            this.props.form.getFieldProps(type);
          });
          input = (
            <Cascader {...getFieldProps(item.searchable.name)} item={item} style={{
              height: '150px'
            }} form={this.props.form} placeholder={item.title} changeOnSelect={true}/>
          );
          break;
        default:
      }
      if (input) {
        return (
          <Form.Item key={index}>
            {input}
          </Form.Item>
        );
      }
    });
    return (
      <Col className='commcrudtable-search'>
        <Form inline form={this.form} onKeyUp={(e) => {
          if (e.keyCode == 13) {
            this.handleSearch.bind(this)(e);
          }
        }}>
          {searchColumns}
          <Button icon='search' className='ant-search-btn' onClick={this.handleSearch.bind(this)}/>
        </Form>
      </Col>
    );
  }
}
SearchComponent = Form.create()(SearchComponent);

SearchComponent.displayName = 'UiSearchComponent';

// Uncomment properties you need
// SearchComponent.propTypes = {};
// SearchComponent.defaultProps = {};

export default SearchComponent;
