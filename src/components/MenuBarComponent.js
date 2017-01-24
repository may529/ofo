'use strict';
require('styles//MenuBar.less');

import React from 'react';
import SS from 'parsec-ss';
import Config from 'config';
import { Menu, Icon, Row, Spin, Button } from 'antd';
import { Link } from 'react-router';
//import request from '../Request';

let menu_key = SS.get('menu_key') == null ? '0' : SS.get('menu_key');


class MenuBarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: '1',
      openKeys: [],
      isOpen: true
    };
  }

  componentWillMount() {
    this.loadMenuData();
    this.props.onToggle(this.state.isOpen);
  }

  componentWillReceiveProps() {
    setTimeout(() => {
      this.matchPath(this.props.location.pathname, '', this.state.menu || []);
    }, 0);
  }

  //匹配路由和菜单展开
  matchPath(path, prefix, parent) {
    parent.map((item) => {
      if (item.url == path) {
        this.setState({ current: '' + item.id });
        return;
      }
      if (item.children) {
        this.matchPath(this.props.location.pathname, item.url, item.children);
      }
      // if ((prefix + (item.to || '')) == path) {
      //   this.setState({current: '' + item.id});
      //   return;
      // }
      // if (item.children) {
      //   this.matchPath(this.props.location.pathname, prefix + (item.to || ''), item.children);
      // }
    });
    return;
  }

  sortMenu(menus) {
    menus.forEach((menui) => {
      if (menui.children) {
        menui.children = this.sortMenu(menui.children);
      }
      menus.forEach((menuj) => {
        if (menuj.seq < menui.seq) {
          let temp = menui;
          menui = menuj;
          menuj = temp;
        }
      });
    });
    return menus;
  }

  loadMenuData() {
    //手动添加菜单信息
    // request({
    //   type:'get',
    //   url:Config.host + '/custom/user-menu',
    //   data:{},
    //   success:(data)=>{
    //     let menus = data.result;
    //     menus.unshift({'urlName':'首页','icon':'&#xe629;','id':1.1,'url':'/'});
    //     this.setState({
    //       menu: this.sortMenu(data.result)
    //     }, ()=> {
    //       this.matchPath(this.props.location.pathname, '', this.state.menu || []);
    //     });
    //   }
    // });
    let menus = {
      'lst': [
        { 'urlName': '愿望清单', 'icon': '&#xe603;', 'id': 5, 'url': '/guestbook' },
        { 'urlName': '数据统计', 'icon': '&#xe615;', 'id': 7, 'url': '/statistics'},
      ],
      'status': 0
    };
    menus.lst.unshift({ 'urlName': '首页', 'icon': '&#xe629;', 'id': 1.1, 'url': '/' });
    this.setState({
      menu: this.sortMenu(menus.lst)
    }, () => {
      this.matchPath(this.props.location.pathname, '', this.state.menu || []);
    });
  }

  handleClick(e) {
    SS.set('menu_key', e.key);
    this.setState({
      current: e.key,
      openKeys: e.keyPath.slice(1)
      // isOpen:true
    });
  }

  onToggle(info) {
    this.setState({
      openKeys: info.open ? info.keyPath : info.keyPath.slice(1)
    });
  }

  handleToogle() {
    this.props.onToggle(!this.state.isOpen);
    this.setState({ isOpen: !this.state.isOpen });
  }

  render() {
    const linkStyle = {
      display: this.state.isOpen ? 'inline-block' : 'none'
    };

    //动态生成菜单项
    var menuItem = (this.state.menu || []).map((item, index) => {
      if (item.children && item.children.length) {
        var chiildren = item.children.map(function (child, childIndex) {
          return (
            <Menu.Item key={'' + child.id}><Link to={child.url}><i className="iconfont"
              dangerouslySetInnerHTML={{ __html: child.icon }}></i><span >{child.urlName}</span></Link></Menu.Item>
          );
        });
        return (
          <Menu.SubMenu key={'' + item.id} title={
            <span onClick={() => {
              //              console.log(item);
              this.setState({ current: '' + item.id });
            } }><i className="iconfont" dangerouslySetInnerHTML={{ __html: item.icon }}></i><span
              style={linkStyle}>{item.urlName}</span></span>}>
            {chiildren}
          </Menu.SubMenu>
        );
      } else {
        return (
          <Menu.Item key={'' + item.id}><Link to={item.url}><i className="iconfont"
            dangerouslySetInnerHTML={{ __html: item.icon }}></i><span
              style={linkStyle}>{item.urlName}</span></Link></Menu.Item>
        );
      }
    });
    return (
      <Spin spinning={menuItem.length == 0}>
        <Row className='menubar-component'>
          <Row className='controller'>
            <Button onClick={this.handleToogle.bind(this)}>{this.state.isOpen ? <Icon type="double-left" /> :
              <Icon type="double-right" />}</Button>
          </Row>
          <Row className='menu'>
            <Menu selectedKeys={[this.state.current]}
              style={{ width: this.state.isOpen ? 240 : 70 }}
              mode={this.state.isOpen ? 'inline' : 'vertical'}>
              {menuItem}
            </Menu>
          </Row>
        </Row>
      </Spin>
    );
  }
}

MenuBarComponent.displayName = 'MenuBarComponent';

// Uncomment properties you need
// MenuBarComponent.propTypes = {};
// MenuBarComponent.defaultProps = {};

export default MenuBarComponent;
