require('styles/antd.less');
require('normalize.css/normalize.css');
require('es5-shim');
require('es5-shim/es5-sham');
require('console-polyfill');
require('babel-polyfill');

import 'core-js/fn/object/assign';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import Config from 'config';
import Main from './components/Main';
import Login from './components/LoginComponent';
import Welcome from './components/WelcomeComponent';
import Guestbook from './components/GuestbookComponent';
import Statistics from './components/StatisticsComponent';
import SS from 'parsec-ss';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  //权限验证(是否登录)
  handleAuth(nextState, replace) {
    // console.log(SS.get(Config.token));
    if (SS.get(Config.token) == null) {
      window.location.href = '#/login';
    }
    return true;
  }

  render() {
    return (
      <Router history={hashHistory}>
        <Route path='/login' component={Login} />
        <Route path='/' onEnter={this.handleAuth} component={Main} breadcrumbName='首页'>
          <IndexRoute component={Welcome} />
          <Router path='/guestbook' breadcrumbName='订单管理' component={Guestbook} />
          <Router path='/statistics' breadcrumbName='数据统计' component={Statistics} />
        </Route>
      </Router>
    );
  }
}

// Render the main component into the dom
ReactDOM.render(<App />, document.getElementById('app'));
