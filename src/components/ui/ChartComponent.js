'use strict';

import React from 'react';
import echarts from 'echarts';

require('styles/ui/Chart.less');

class ChartComponent extends React.Component {
  componentWillMount(){
    let id  = Date.now() +''+ (Math.floor(Math.random()*10000000000%100000));
    this.setState({
      id:'chart'+id
    });
  }
  componentDidMount(){
    // console.log("componentDidMount",this.props.option);
    // console.log( this.state.id,document.getElementById(this.state.id) );
    let myChart = echarts.init(document.getElementById(this.state.id));
    this.setState({
      myChart:myChart
    });

    //绑定事件处理
    (this.props.option.Events || []).forEach((event)=>{
        (event.call || []).forEach((call)=>{
          myChart.on(event.type,call);
        });
    });
    this.props.option.Events;

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption( this.props.option );
  }
  componentWillReceiveProps(nextProps){
    //console.log("componentWillReceiveProps",nextProps);
    this.state.myChart.setOption( nextProps.option );
  }
  render() {
    let styles = {
      width:this.props.option.width || '100%',
      height:this.props.option.height || 520
    }
    return (
      <div className="chart-component" id={this.state.id} style={styles}>
        图表初始化出错
      </div>
    );
  }
}

ChartComponent.displayName = 'UiChartComponent';

// Uncomment properties you need
// ChartComponent.propTypes = {};
// ChartComponent.defaultProps = {};

export default ChartComponent;
