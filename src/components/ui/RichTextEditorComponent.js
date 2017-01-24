'use strict';

import React from 'react';
import wangEditor from 'wangEditor';
import Config from 'config';
import SS from 'parsec-ss';
import { Input, Upload,message } from 'antd';

require('styles/ui/RichTextEditor.less');

class RichTextEditorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  componentWillMount() {
    let id = parseInt(Date.now() + '' + (Math.floor(Math.random() * 100000000000000000 % 100000000)));
    this.setState({
      id: 'editor' + id
    });
    //$(document).on('click',this.handleClick);
  }
  handleClick(event) {
    let editor = this.state.editor;
    //    console.log( $.contains(editor.$editorContainer[0],event.target) );
    // debugger;
    if ($.contains(editor.$editorContainer[0], event.target)) {
      return;
    }
    return;
    let values = this.props.form.getFieldsValue();
    values[this.props.item.dataIndex] = editor.$txt.html();
    this.props.form.setFieldsValue(values);
  }
  componentWillUnmount() {
    //    console.log('componentDidUnMount');
    $(document).off('click', this.handleClick);
  }
  initContent() {
    if(!this.state.editor){
      return;
    }
    let editor = this.state.editor;
    let values = this.props.form.getFieldsValue();
    if (!!this.props.form) {
      //表单值初始化编辑器内容
      let values = this.props.form.getFieldsValue();
      editor.$txt.html(values[this.props.item.dataIndex]);
      editor.$valueContainer.off('blur').on('blur', (event) => {
        // console.log(editor.$editorContainer,event.relatedTarget,$.contains(editor.$editorContainer[0],event.relatedTarget));
        if ($.contains(editor.$editorContainer[0], event.relatedTarget)) {
          return;
        }
        //        console.log(editor.$txt.html());
        let values = this.props.form.getFieldsValue();
        values[this.props.item.dataIndex] = editor.$txt.html();
        this.props.form.setFieldsValue(values);
        // debugger;
      });
    } else {
      //content初始化编辑器内容
      editor.$txt.html(values[this.props.content]);
    }

    // if( this.props.display ){
    //   //禁用编辑器
    //   editor.destroy();
    // }else{
    //   //恢复编辑器
    //   editor.undestroy();
    // }
  }
  componentWillReceiveProps() {
    this.initContent();
  }
  componentDidMount() {
    let editor = new wangEditor(this.state.id);
    //菜单配置
    editor.config.menus = [
      // 'source',
      'bold', 'underline', 'italic', 'strikethrough', 'eraser', 'forecolor', 'bgcolor',
      'quote', 'fontfamily', 'fontsize', 'head', 'unorderlist', 'orderlist', 'alignleft', 'aligncenter', 'alignright',
      'img', 'formaul',
      'undo', 'redo', 'fullscreen'
    ]

    editor.config.customUpload = true;  // 配置自定义上传的开关
    editor.config.customUploadInit = () => {
      // this 即 editor 对象
      let editor = this.state.editor;
      // 编辑器中，触发选择图片的按钮的id
      let elem_btnId = document.getElementById(editor.customUploadBtnId);
      // 编辑器中，触发选择图片的按钮的父元素的id
      let elem_containerId = document.getElementById(editor.customUploadContainerId);
      // debugger;
      elem_btnId.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log($(`#${this.state.id} [type=file]`));
        $(`#${this.state.id}`).closest('.richtexteditor-component').find('[type=file]').click();
        console.log(e);
      })
    };  // 配置上传事件，uploadInit方法已经在上面定义了


    //创建编辑器
    editor.create();

    // editor.undestroy();

    this.setState({
      editor: editor
    }, () => {
      this.initContent();
    });
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
        let editor = this.state.editor;
        info.file.url = Config.host + info.file.response.result;
        editor.command(null, 'insertHtml', '<img src="' + info.file.url + '" style="max-width:100%;"/>');
        break;
      case 'error':
        message.error(info.file.response.error);
        break;
    }
  }
  render() {
    const item = this.props.item;
    const props = {
      action: Config.host + '/api/admin/common/upload',
      beforeUpload: this.handlebeforeUploade.bind(this),
      onChange: this.handleChange.bind(this),
      multiple: false,//支持多选
      accept: item.uploadAccept,
      headers: {
        [Config.token]: 'Bearer ' + SS.get(Config.token),
        'Access-Control-Request-Headers': 'authorization, x-requested-with'
      },
      //showUploadList:true,
      showUploadList: item.showUploadListType == true ? true : false,
      listType: this.state.type == 'image' ? 'picture-card' : 'text',
      //defaultFileList: Config.validateRules.isNull(imgUrl) ? [] : defaultFileList,
    };

    return (
      <div className="richtexteditor-component">
        <div className='editor' id={this.state.id} name='content' type='text/plain'></div>
        <Upload {...props} fileList={this.state.fileList} style={{ display: 'none' }}>
          <div className="ant-upload-text">aaaaaa</div>
        </Upload>
        <Input className='values' type='hidden' {...this.props} />
      </div>
    );
  }
}

RichTextEditorComponent.displayName = 'UiRichTextEditorComponent';

// Uncomment properties you need
// RichTextEditorComponent.propTypes = {};
// RichTextEditorComponent.defaultProps = {};

export default RichTextEditorComponent;
