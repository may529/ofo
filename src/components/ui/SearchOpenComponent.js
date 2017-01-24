'use strict';

import React from 'react';
import {Table, Input, Button, Modal, message, Row, Col, Icon, Tooltip, Menu, DatePicker} from 'antd';
import dateFormat from 'date-format'

require('styles//ui/SearchOpen.less');

class SearchOpenComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {}
    }
  }

  componentWillMount() {
    let params = {};
    this.props.searchColumns.forEach((item) => {
      if (item.searchable.name instanceof Array) {
        params[item.searchable.name[0]] = (item.searchable.defaultValue || [])[0] || null;
        params[item.searchable.name[1]] = (item.searchable.defaultValue || [])[1] || null;
      } else {
        params[item.searchable.name] = item.searchable.defaultValue || null;
      }
    });
    this.handleParamsChange(params);
  }

  handleParamsChange(params) {
    let flag = true,length = 0;
    for (let key in params) {
      if (params[key] != this.state.params[key]) {
        flag = false;
      }
      if(!!params[key]){
        length++;
      }
    }

    //如果搜索的字段值一样，则不搜索。
    if (flag && length!=0) {
      return;
    }


    let values = Object.assign({}, this.state.params, params);
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
    this.setState({params: searcher}, () => {
      // Console.log(params);
    });

    this.props.instance.setState({
      searcher: searcher
    }, () => {
      this.props.instance.reLoad();
    });
  }

  //选择 一月内 3月内 一年类
  handleDateChose(item, month) {
    let param = {};
    let current = new Date();
    param[item.searchable.name[1]] = current.getTime();
    param[item.searchable.name[0]] = current.setMonth(current.getMonth() - month);
    // Console.log(new Date(param[item.searchable.name[0]]).toLocaleDateString());
    // Console.log(new Date(param[item.searchable.name[1]]).toLocaleDateString());


    this.handleParamsChange(param);
  }

  render() {
    let searchColumns = this.props.searchColumns.map((item) => {
      let searcher;
      switch (item.dataType) {
        case 'text':
          searcher = (<Input onBlur={(e) => {
            let value = e.target.value;
            this.handleParamsChange({
              [item.searchable.name ]: value
            });
          }} onPressEnter={(e) => {
            let value = e.target.value;
            this.handleParamsChange({
              [item.searchable.name ]: value
            });
          }}/>);
          break;
        case 'select':
          searcher = (item.chlidOptionsFilter?item.chlidOptionsFilter(item.chlidOptions,this.state.params):(item.chlidOptions || [])).map((option) => {
            return (
              <Button
                className="item"
                type={this.state.params[item.searchable.name] === option.value ? 'primary' : ''}
                key={option.value}
                onClick={() => {
                  let param = {};
                  if (this.state.params[item.searchable.name] === option.value) {
                    param[item.searchable.name] = null;
                  } else {
                    param[item.searchable.name] = option.value;
                  }
                  this.handleParamsChange(param);
                } }
              >
                {option.text}
              </Button>
            );
          });
          break;
        case 'date':
          searcher = (
            <Col>
              <span className="item">
                <DatePicker.RangePicker style={{
                  width: '280px'
                }} value={(() => {
                  return [
                    this.state.params[item.searchable.name[0]] ? new Date(this.state.params[item.searchable.name[0]]) : undefined,
                    this.state.params[item.searchable.name[1]] ? new Date(this.state.params[item.searchable.name[1]]) : undefined,
                  ];
                })()} onChange={(range) => {
                  this.setState({
                    dateRange: range
                  });
                  let param = {};
                  param[item.searchable.name[0]] = range[0] ? range[0].getTime() : null;
                  param[item.searchable.name[1]] = range[1] ? range[1].getTime() : null;
                  this.handleParamsChange(param);
                } }/>
              </span>
              <Button className="item" onClick={() => {
                this.handleDateChose(item, 1);
              } }>一个月内</Button>
              <Button className="item" onClick={() => {
                this.handleDateChose(item, 3);
              } }>三个月内</Button>
              <Button className="item" onClick={() => {
                this.handleDateChose(item, 12);
              } }>一年内</Button>
            </Col>
          );
          break;
        default:
          return null;
      }
      return (
        <Row className="item" key={item.searchable.name}>
          <Col className="left">{item.title }</Col>
          <Col className="right">{searcher}</Col>
        </Row>
      );
    });
    return (
      <Col className="searchopen-component">
        {searchColumns}
      </Col>
    );
  }
}

SearchOpenComponent
  .displayName = 'UiSearchOpenComponent';

// Uncomment properties you need
// SearchOpenComponent.propTypes = {};
// SearchOpenComponent.defaultProps = {};

export
default
SearchOpenComponent;
