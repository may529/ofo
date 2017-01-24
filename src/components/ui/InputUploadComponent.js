'use strict';
require('styles/ui/InputUpload.less');

import React from 'react';
import { Modal, Upload, message, Col, Row, Button, Icon, Input } from 'antd';
import request from '../../Request';
import Config from 'config';
import SS from 'parsec-ss';


class InputUploadComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      priviewVisible: false,
      priviewImage: '',
      addLoding: false,
      layout: [],
      fileList: null,
      type: 'text'
    }
  }
  componentWillMount() {
    let layout = [];
    layout.push(this.props.item.uploadLayout);

    this.setState({
      layout: layout,
      type: this.props.item.uploadType,
    });
  }
  handleSelect(value, option) {
    //console.log('InputUploadComponent-handleSelect',value,option);
    //return false;
  }
  handlebeforeUploade(file) {
    // let key = parseInt(Date.now() + '' + (Math.floor(Math.random() * 100000000000000000 % 100000000)));
    // let suffix = file.name.match(/\.[^\.]+$/);
    // qiniuInfo.key = key + suffix;
    const isLt2M = file.size / 1024 < 512;
    if (!isLt2M) {
      message.error('图片不能大于512k');
      return false;
    }
  }
  handleChange(info) {
    // console.log(info.file.status);
    //去掉后缀名的文件名
    info.file.originName = info.file.name.replace(/\.[^\.]+$/, '');
    const {item, form} = this.props;


    let values = form.getFieldsValue();
    let fileList = info.fileList;
    if (!item.multiple) {
      //限制上传列表
      fileList = fileList.slice(-1);
    } else {

      // fileList.fileList.forEacrh((item) => {
      //   if (item.status == 'uploading') {
      //     item.uploadDate = Date.now();
      //   }
      //   if (item.uploadDate == undefined) {
      //     item.uploadDate = 0;
      //   }
      // }).sort((a, b) => {
      //   return a.uploadDate - b.uploadDate;
      // });
    }
    this.setState({ fileList });

    //let qiniuInfo = this.state.qiniuInfo;
    switch (info.file.status) {
      case 'uploading':
        // info.file.name = qiniuInfo.key+suffix;
        break;
      case 'done':
        info.file.url = Config.host+info.file.response.result;
        if (!item.multiple) {
          values[item.dataIndex] = info.file.url;
          values[item.dataIndexAlia] = info.file.originName;
        } else {
          values[item.dataIndex] = values[item.dataIndex] ? values[item.dataIndex] : [];
          values[item.dataIndex].push(info.file.url);
          values[item.dataIndexAlia] = values[item.dataIndexAlia] ? values[item.dataIndexAlia] : [];
          values[item.dataIndexAlia].push(info.file.originName);
        }
        // console.log(values);
        this.setState({ fileList });
        // console.log(fileList);
        form.setFieldsValue(values);
        if (typeof this.props.onChangeFile == 'function') {
          this.props.onChangeFile(values);
        }
        break;
      case 'error':
        message.error(info.file.response.error);
        break;
    }
  }
  handleCancel() {
    this.setState({
      priviewVisible: false
    });
  }
  render() {
    const item = this.props.item;
    let imgUrl = this.props.form.getFieldValue(item.dataIndex);
    let fileList = this.state.fileList;

    //
    if (fileList === null) {
      if (!item.multiple) {
        if (!Config.validateRules.isNull(imgUrl)) {
          fileList = [{
            uid: -1,
            name: '',
            status: 'done',
            url: imgUrl,
            thumbUrl: imgUrl
          }];
        }
      }
      else {
        fileList = (imgUrl || []).map((url, index) => {
          return {
            uid: -index,
            name: '',
            status: 'done',
            url: url,
            thumbUrl: url
          }
        });
      }
    }


    const props = {
      action: Config.host+'/api/admin/common/upload',
      beforeUpload: this.handlebeforeUploade.bind(this),
      onChange: this.handleChange.bind(this),
      multiple: false,//支持多选
      accept: item.uploadAccept,
      headers: {
        [Config.token]: 'Bearer '+SS.get(Config.token)
      },
      //showUploadList:true,
      showUploadList: item.showUploadListType == true ? true : false,
      listType: this.state.type == 'image' ? 'picture-card' : 'text',
      //defaultFileList: Config.validateRules.isNull(imgUrl) ? [] : defaultFileList,
      onPreview: (file) => {
        this.setState({
          priviewImage: file.url,
          priviewVisible: true
        });
      },
      onRemove: (file) => {
        const {item, form} = this.props;
        let values = form.getFieldsValue();
        if (!item.multiple) {
          values[item.dataIndex] = null;
        } else {
          let index = values[item.dataIndex].findIndex(x => x === file.url);
          values[item.dataIndex].splice(index, 1);
        }
        form.setFieldsValue(values);
      }
    };
    let { getFieldProps } = this.props.form;
    // debugger;
    let formItem = (this.state.layout || []).map((_item) => {
      let input = '';
      //console.log(_item);
      switch (_item) {
        case 'inline':
          input = (<Row>
            {this.state.type == 'image' ?
              <Row>
                <Col span={24}>
                  <Input type='hidden' {...this.props} />
                  <Upload {...props} fileList={fileList}>
                    <Icon type="plus" />
                    <div className="ant-upload-text">{item.uploadBtnText}</div>
                  </Upload>
                </Col>
              </Row>
              :
              <Row>
                <Col span={18}>
                  <Input type={item.showAlia == false ? 'hidden' : 'text'} {...getFieldProps(item.dataIndexAlia) } disabled={item.disabled} autoComplete='off' placeholder={item.title} />
                  <Input type='hidden' {...this.props} />
                </Col>
                <Col span={6} className='upload-btn'>
                  <Upload {...props} fileList={fileList}>
                    <Button type='ghost'>
                      <Icon type='upload' />{item.uploadBtnText}
                    </Button>
                  </Upload>
                </Col>
              </Row>
            }
          </Row>);
          break;
        case 'horizontal':
          input = (<Row>
            {
              this.state.type == 'image' ?
                <Row >
                  <Col span={24}>
                    <Input type='hidden' {...this.props} />
                    <div className="clearfix">
                      <Upload {...props} fileList={fileList}>
                        <Icon type="plus" />
                        <div className="ant-upload-text">上传照片</div>
                      </Upload>
                    </div>
                  </Col>
                </Row>
                :
                <Row>
                  <Col span={24}>
                    <Input type={item.showAlia == false ? 'hidden' : 'text'} {...getFieldProps(item.dataIndexAlia) } disabled={item.disabled} autoComplete='off' placeholder={item.title} />
                    <Input type='hidden' {...this.props} />
                    <Upload {...props} fileList={fileList}>
                      <Button type='ghost'>
                        <Icon type='upload' />
                        <span>{item.uploadBtnText}</span>
                      </Button>
                    </Upload>
                  </Col>
                </Row>
            }
          </Row>);
          break;
        default:
          break;
      }
      return (
        <Row>
          {input}
        </Row>
      );
    });

    return (
      <Row className='inputupload-component'>
        {formItem}

        <Modal visible={this.state.priviewVisible} footer={null} onCancel={() => {
          this.setState({ priviewVisible: false });
        } }>
          <img alt="example" style={{ width: '100%' }} src={this.state.priviewImage} />
        </Modal>

      </Row>
    );
  }
}

InputUploadComponent.displayName = 'InputUploadComponent';

// Uncomment properties you need
// InputUploadComponent.propTypes = {};
// InputUploadComponent.defaultProps = {};

export default InputUploadComponent;
