require('styles/App.less');

import React from 'react';
import NavBar from './NavBarComponent';
import MenuBar from './MenuBarComponent';
import {Row, Col, Breadcrumb} from 'antd';


class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  handleToggle() {
    this.setState({isOpen: !this.state.isOpen});
  }

  componentWillMount() {
  }

  render() {
    return (
      <Row className='container'>
        <Row className='top'>
          <NavBar />
        </Row>
        <Row className={this.state.isOpen ? 'main open' : 'main'}>
          <Col className='right'>
            <Row className="breadcrumb">
              <Breadcrumb separator=">" {...this.props}/>
            </Row>
            <Row className="content">
              {this.props.children}
            </Row>
          </Col>

          <Col className='left' style={{height: '100%', _height: '100%'}}>
            <MenuBar {...this.props} onToggle={this.handleToggle.bind(this)}/>
          </Col>
        </Row>
      </Row>
    );
  }
}

AppComponent.defaultProps = {};

export default AppComponent;
