'use strict';
require('styles/ui/CommCrudtable.less');

import React from 'react';
import { Table, Button, Modal, message, Row, Col, Tooltip, Menu } from 'antd';
import { Form } from 'antd';
import Icon from './IconComponent';
import Request from '../../Request';
import ModifyForm from './ModifyFormComponent';
import Search from './SearchComponent';
import SearchOpen from './SearchOpenComponent'

class CommCrudtableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],  //获取的数据
      rawData: [],//源数据，提供给筛选
      filterData: [],
      filterKey: '',//用于本地筛选数据的key
      filterValue: null,
      pagination: { current: 1, total: 10, pageSize: 10 }, //初始化分页
      sorter: {},
      searcher: {},
      loading: false, //是否加载状态
      selectedRows: [], //当前选择的行
      selectedRowKeys: [],
      modifyRow: null,//需要编辑的行
      showColumns: [],
      searchColumns: [],
      editColumns: [],
      modifyShowType: 'hide',  //编辑表单的显示状态 hide add modify
      modifyIsLoading: false, //编辑表单是否是提交状态
      operaItem: [],
      actionItem: [],
      extColumns: []
    }

    this.handleDelete = this.handleDelete.bind(this);
  }

  /**
   *分页改变时回调
   */
  handleTableChange(pagination, filters, sorter) {
    if (!!sorter.field) {
      sorter.orderName = sorter.field;
      sorter.sort = sorter.order == 'descend' ? 'desc' : 'asc';
    }
    this.setState({
      pagination: pagination,
      sorter: sorter
    }, () => {
      this.loadData();
    });
    return;
  }

  //当搜索时
  handleSearch(params) {
    //console.log( 'handleSearch' )
  }

  //刷新
  reFresh() {
    this.loadData();
  }

  reLoad() {
    this.setState({
      filterValue: '',
      pagination: { current: 1, total: 10, pageSize: 10 }
    }, () => {
      this.loadData();
    });
  }

  /**
   *载入数据
   */
  getParams() {
    const pagination = this.state.pagination;
    const sorter = this.state.sorter;
    const searcher = this.state.searcher;
    return Object.assign({}, {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      orderName: sorter.orderName,
      sort: sorter.sort,
    }, searcher);
  }

  loadData() {
    let data = [];
    let params = this.getParams();
    this.setState({
      loading: true
    });

    function onLoadData(data) {
      console.log(data);
      if (data.code !== 0) {
        message.error(data.message);
        return;
      }

      let result = data.result;

      //预处理数据
      if (typeof this.props.dataWarp == 'function') {
        result = this.props.dataWarp(result);
      }

      let pagination = this.state.pagination;
      pagination.total = result.pageTotal * params.pageSize;
      let lst = (result.list || result.lst || result.array);
      lst.forEach((item) => {
        item.key = item.id;
      });

      this.setState({
        data: (data[this.props.filter.field] || lst),
        rawData: lst,
        filterData: this.filterData(lst),
        loading: false,
        pagination,
        selectedRows: [],
        selectedRowKeys: [],
        params // 记录参数，供刷新使用
      }, () => {
        // console.log(this.state.filterValue);
        if (!!this.props.filter.key) {
          if (this.state.filterValue) {
            this.handleFilter({ key: this.state.filterValue });
          } else {
            this.handleFilter({ key: (this.state.filterData[0] || {}).id });
          }
        }
      });
      // console.log(this.state.filterValue);
    }

    onLoadData = onLoadData.bind(this);
    if (typeof this.props.operaUrl.loadDataUrl === 'function') {
      this.props.operaUrl.loadDataUrl(params, onLoadData);
    } else {
      Request({
        type: 'get',
        url: this.props.operaUrl.loadDataUrl,
        data: params,
        success: onLoadData
      });
    }
  }

  //预处理筛选数组
  filterData(data) {
    if (!this.props.filter.key) {
      return data;
    }
    //相互关联
    data.forEach((item) => {
      if (!item[this.props.filter.field]) {
        item[this.props.filter.field] = [];
      }
      item[this.props.filter.field].forEach((child) => {
        child[this.props.filter.key] = item.id;
        child[this.props.filter.name] = item.name;
      });
    });
    return data;
  }

  saveData(obj) {
    obj = Object.assign({}, obj);
    // obj = this.checkObjAttributeFormat(obj);
    if (typeof this.props.dataFormat === 'function') {
      obj = this.props.dataFormat(obj);
    }
    let that = this;
    this.setState({ modifyIsLoading: true });
    Request({
      type: 'post',
      url: this.props.operaUrl.saveOrUpdateUrl,
      data: obj,
      success: (data) => {
        if (data.code != 0) {
          message.error(data.message);
          that.setState({
            modifyIsLoading: false
          });
        } else {
          message.success('保存成功');
          that.reFresh();
          that.setState({
            modifyShowType: 'hide',
            modifyIsLoading: false
          });
        }
      }, error: (data) => {
        message.error(data.message);
        that.setState({
          modifyIsLoading: false
        });
      },
    });
  }

  /**
   *删除选择的列
   */
  handleDelete() {
    Modal.confirm({
      title: '确定要删除吗?',
      onOk: () => {
        let keys = this.state.selectedRows.map((item) => {
          return item.id;
        });

        Request({
          type: 'delete',
          url: this.props.operaUrl.delUrl + keys[0],
          success: (data) => {
            if (data.code != 0) {
              message.error(data.message);
              this.setState({
                modifyIsLoading: false
              });
            } else {
              message.success('删除成功');
              this.reFresh();
              this.setState({
                selectedRows: [],
                selectedRowKeys: []
              });
            }
          },
          dataType: 'JSON'
        });
      },
      onCancel() {
      },
    });
  }

  componentWillMount() {
    let that = this;
    //为每列指定key. 给指定了 bindValidata的item 互相bind
    this.props.columns.forEach((item) => {
      item.key = item.dataIndex;
      if (item.bindValidata) {
        this.props.columns.filter((col) => {
          return col.dataIndex == item.bindValidata;
        })[0].reBind = item.dataIndex;
      }
    });

    //获取各个字段
    let showColumns = this.props.columns.filter((item) => {
      return item.showable != false
    });
    //深拷贝一下
    // showColumns = JSON.parse(JSON.stringify(showColumns));
    //编辑按钮

    let operaItem = (this.props.operaItem || []).map((item) => {
      return item
    });
    if (this.props.showDefaultBtn.showEditBtn != false && !this.props.filter.key) {
      operaItem.splice(0, 0, {
        title: '编辑',
        icon: 'edit',
        call: function (record, instance) {
          instance.setState({
            modifyRow: record,
            modifyShowType: 'modify'
          }, () => {
            //FIX 有别名的要保留
            instance.props.form.resetFields();
            instance.props.form.setFieldsValue(record);
            // console.log(record,instance.props.form.getFieldsValue());
          });
        }
      });
    }
    operaItem.sort((a, b) => {
      return (a.sort || 99999) > (b.sort || 99999);
    });

    if (operaItem.length != 0) {
      showColumns.push({
        title: this.props.operaTitle || '操作',
        key: 'opera',
        render: (text, record, index) => {
          const style = {
            margin: '0px 10px',
            cursor: 'pointer'
          };
          let operaItems = this.state.operaItem.filter((item) => {
            if (typeof item.when == 'function') {
              return item.when(text, record, index);
            }
            return true;
          }).map((opera) => {
            let title = opera.title;
            if (typeof opera.title == 'function') {
              title = opera.title(record, this);
            }
            return (
              <Tooltip key={opera.title} placement='bottom' title={title} onClick={() => {
                opera.call(record, this)
              } }>
                <Icon type={opera.icon} style={style} />
              </Tooltip>
            );
          });
          return (
            <Col>
              {operaItems}
            </Col>
          );
        }
      });
    }

    //顶部菜单
    let actionItem = (this.props.actionItem || []).map((item) => {
      return item
    });

    if (this.props.showDefaultBtn.showDeleteBtn != false) {
      actionItem.splice(0, 0, {
        title: '删除',
        icon: 'delete',
        type: 'primary',
        multiple: true,
        when: 1,
        call: this.handleDelete.bind(this)
      });
    }
    if (!!this.props.filter.key) {
      actionItem.splice(0, 0, {
        title: '编辑',
        icon: 'edit',
        type: 'primary',//按钮样式
        multiple: false,
        when: 1,
        call: (record, instance) => {
          if (!instance.state.filterValue) {
            message.error("请选择");
            return;
          }
          record = (instance.state.filterData || []).filter((item) => {
            return instance.state.filterValue == item.id;
          })[0] || {};
          record = JSON.parse(JSON.stringify(record));
          //把子数据数组变成id字符串
          record[instance.props.filter.field] = record[instance.props.filter.field].map((child) => {
            return child.id;
          }).join(",");

          //console.log(record);
          instance.setState({
            modifyRow: record,
            modifyShowType: 'modify'
          });
          instance.props.form.resetFields();
          instance.props.form.setFieldsValue(record);
        }
      });
    }
    if (this.props.showDefaultBtn.showAddBtn != false) {
      actionItem.splice(0, 0, {
        title: '新增',
        icon: 'edit',
        type: 'primary',//按钮样式
        multiple: true,
        when: 0,
        call: (record, instance) => {
          instance.setState({
            modifyRow: record[0] || {},
            modifyShowType: 'modify'
          }, () => {
            instance.props.form.resetFields();
            instance.props.form.setFieldsValue({});
          });
        }
      });
    }
    actionItem.sort((a, b) => {
      return (a.sort || 99999) > (b.sort || 99999);
    });

    showColumns.forEach((item) => {
      item.key = item.dataIndex;
    });
    let searchColumns = this.props.columns.filter((item) => {
      return (item.searchable || {}).isDispaly == true
    });
    let editColumns = this.props.columns.filter((item) => {
      return item.editable != false
    });
    let extColumns = this.props.extColumns.map((item) => {
      return item;
    });
    //console.log('searchColumns',searchColumns);
    this.setState({
      showColumns,
      extColumns,
      searchColumns,
      editColumns,
      operaItem,
      actionItem
    });

    this.initOptinData();
    //开放式的搜索，要等搜索按钮加载完再加载第一次数据
    if (this.props.searchType === 'open') {

    } else {
      this.loadData();
    }
  }

  //初始化下拉框字段的选项
  initOptinData() {
    this.props.columns.forEach((item) => {
      if (typeof item.chlidOptionsUrl == 'string') {
        //跳过
        if (item.dataType == 'transfer' || item.dataType == 'inputSelect') {
          return;
        }
        Request({
          url: item.chlidOptionsUrl,
          data: {},
          success: (data) => {
            if (data.code != 0) {
              message.error(data.message);
              return;
            }

            data = data.result;
            if (typeof item.dataWarp === 'function') {
              data = item.dataWarp(data);
            }
            item.chlidOptions = (data.list || data.lsts || data.array || data.lst || data.result);
            if (item.dataType != "cascader") {
              item.chlidOptions.forEach((option) => {
                option.value = option[item.chlidOptionsType.value];
                option.text = option[item.chlidOptionsType.text];
              });
            }
            this.setState({
              selectedRowKeys: this.state.selectedRowKeys,
              selectedRows: this.state.selectedRows
            });
          }
        });
      }
    });
  }

  /**
   *选择表格列发生变化时回调
   */
  onSelectChange(selectedRowKeys, selectedRows) {
    // console.log('selectedRows',selectedRows);
    this.setState({
      selectedRowKeys,
      selectedRows
    });
  }

  /**
   *提交新增/修改
   */
  handleSubmit(e) {
    // e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //console.log('Errors in form!!!');
        return;
      }
      this.saveData(values);
    });
  }

  handleFilter(event) {
    let key = parseInt(event.key);
    let data = (this.state.filterData || []).filter((item) => {
      return key == item.id;
    })[0] || {};
    this.setState({
      data: data[this.props.filter.field] || [],
      filterValue: key,
      selectedRows: !key ? [] : [{ id: key }]
    });
    //console.log(key);
  }

  renderFilterPanel() {
    if (!this.props.filter.key) {
      return null;
    }
    let menuItems = (this.state.filterData || []).map((item) => {
      return (
        <Menu.Item key={item.id}>{item.name}({item[this.props.filter.field].length})</Menu.Item>
      );
    });
    return (
      <Col span={6}>
        <Menu onClick={this.handleFilter.bind(this)} selectedKeys={[this.state.filterValue + '']}>
          {menuItems}
        </Menu>
      </Col>
    );
  }

  isShowSelection() {
    if (!!this.props.filter.key) {
      return false;
    }
    if(this.props.showDefaultBtn.showSelection === false){
      return false;
    }

    if (this.props.showDefaultBtn.showDeleteBtn == false) {
      var flag = true;
      for (let i = 0; i < this.state.actionItem.length; i++) {
        let item = this.state.actionItem[i];
        if (!!item.when && item.when >= 1) {
          flag = false;
        }
      }
      if (flag) {
        return false;
      }
    }
    return true;
  }

  getHead() {
    let actions = this.state.actionItem.map((action, index) => {
      let selected = this.state.selectedRows.length;
      let disabled = true;
      if (selected >= (action.when || 0)) {
        disabled = false;
      }
      if (selected > 1 && !action.multiple) {
        disabled = true;
      }
      return (
        <Button type={action.type} key={index} disabled={disabled} onClick={() => {
          action.call(this.state.selectedRows, this);
        } }>{action.title}</Button>
      );
    });


    if (this.state.searchColumns.length <= 0) {
      return undefined;
    }
    if (this.props.searchType === 'open') {
      return (
        <Row className='commcrudtable-head'>
          <SearchOpen searchColumns={this.state.searchColumns} onSearch={this.handleSearch.bind(this)}
            instance={this} />
          <Col className='commcrudtable-opera'>
            {actions}
          </Col>
        </Row>
      )
    } else {
      return (
        <Row className='commcrudtable-head'>
          <Col className='commcrudtable-opera'>
            {actions}
          </Col>
          <Search searchColumns={this.state.searchColumns} onSearch={this.handleSearch.bind(this)} instance={this} />
          <Col style={{ clear: 'both' }}></Col>
        </Row>
      )
    }
  }

  render() {
    let actions = this.state.actionItem.map((action) => {
      let selected = this.state.selectedRows.length;
      let disabled = true;
      if (selected >= (action.when || 0)) {
        disabled = false;
      }
      if (selected > 1 && !action.multiple) {
        disabled = true;
      }
      return (
        <Button key={action.title} icon={action.icon} type={action.type} disabled={disabled} onClick={() => {
          action.call(this.state.selectedRows, this);
        } }>{action.title}</Button>
      );
    });

    //左侧面板
    let filterPanel = this.renderFilterPanel();
    let pagination = {};
    if (this.props.pagination != undefined) {
      pagination = this.props.pagination;
    } else {
      pagination = !!this.props.filter.key != false ? false : this.state.pagination;
    }
    return (
      <Row className='commcrudtable-component'>
        {this.getHead()}
        <Row className='commcrudtable-body'>
          {filterPanel}
          <Col span={filterPanel ? 18 : 24}>
            <Table columns={this.state.showColumns}
              expandedRowRender={this.props.expandedRowRender}
              dataSource={this.state.data}
              pagination={pagination}
              loading={this.state.loading}
              rowKey={x => x.id}
              onChange={this.handleTableChange.bind(this)}
              rowSelection={!this.isShowSelection() ? null : {
                type: !!this.props.multiple ? 'checkbox' : 'radio',
                onChange: this.onSelectChange.bind(this),
                selectedRowKeys: this.state.selectedRowKeys
              }} />
          </Col>
        </Row>
        {(this.state.modifyShowType != 'hide') &&
          <Modal title='订单详情'
            id='modifyShow'
            width={600}
            zIndex={99}
            visible={this.state.modifyShowType != 'hide'}
            onCancel={() => {
              this.setState({ modifyShowType: 'hide', modifyRow: {} });
            } }
            onOk={this.handleSubmit.bind(this)}
            confirmLoading={this.state.modifyIsLoading}>
            <ModifyForm
              tips={this.props.tips}
              data={this.state.modifyRow}
              columns={this.state.editColumns}
              extColumns={this.state.extColumns}
              form={this.props.form}
              instance={this} />
          </Modal>
        }
      </Row>
    );
  }
}
CommCrudtableComponent.defaultProps = {
  actionItem: [],
  extColumns: [],
  showDefaultBtn: {},
  filter: {}
};

CommCrudtableComponent = Form.create()(CommCrudtableComponent);
// Uncomment properties you need
// CommCrudtableComponent.propTypes = {};


export default CommCrudtableComponent;
