'use strict';

import React from 'react';
import {Icon} from 'antd';

require('styles//ui/Icon.less');

class IconComponent extends React.Component {
  render() {
    const { type, className = '' } = this.props;
    // console.log(this.props.type);
    if(/^\&\S+\;$/.test(this.props.type)){
      return (
        <i
          {...this.props}
          className={`${className} iconfont`.trim()}
          dangerouslySetInnerHTML={{
            __html:type
          }}
        />);
    }else{
      return (<Icon {...this.props}/>);
    }
  }
}

IconComponent.displayName = 'UiIconComponent';

// Uncomment properties you need
// IconComponent.propTypes = {};
IconComponent.defaultProps = {
  type:''
};

export default IconComponent;
