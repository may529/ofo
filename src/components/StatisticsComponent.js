'use strict';

import React from 'react';
import {Row,Col,DatePicker,Spin,message,Select} from 'antd';
import Chart from './ui/ChartComponent';
import Config from 'config';
import moment from 'moment';
import request from '../Request';

require('styles//Statistics.less');
const Option = Select.Option;
const dateFormat = 'YYYYMMDD';
class StatisticsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pv:[],//纵坐标pv
      uv:[],//纵坐标uv
      sumPv:0,//该时间段UV总量
      xAxis:[],//横坐标,日期数组,
      loading:false,//数据加载状态
      params:{},//查询参数
    };
  }
  getOption(chartData) {
    return {
      title: {
        text:'PV/UV统计'+(chartData.title?("—"+chartData.title):""),
      },
      legend:{
        top:16,
        data:[{
          name: 'PV',
          icon: 'rect',
          textStyle:{
            fontSize:18
          }
        },{
          name: 'UV',
          icon: 'rect',
          textStyle:{
            fontSize:18
          }
        }]
      },
      grid:{
        top:75,
        bottom:40
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }},
      xAxis: {
        name:'日期',
        nameRotate:60,
        nameTextStyle:{
          fontSize:16
        },
        data:chartData.xAxis.length?chartData.xAxis:[0]
      },
      yAxis:[{
        name:'PV/UV',
        scale:1,
        nameTextStyle:{
          fontSize:16
        }
      }],
      series: [{
        name: 'PV',
        type: 'line',
        smooth: true,
        itemStyle:{
          normal:{
            color:'#FF6100'
          }
        },
        data:chartData.pv.length?chartData.pv:[0]
      },{
        name: 'UV',
        type: 'line',
        smooth: true,
        itemStyle:{
          normal:{
            color:'#00A0E8'
          }
        },
        data: chartData.uv.length?chartData.uv:[0]
      }]
    }
  }
  onChange(value,dateString){//选择统计时间
    let params=this.state.params;
    params.end=dateString[1];
    params.start=dateString[0];
    params.event="home";
    params.metrics='event_user,event_count';
    this.loadData(params);
  }
  handleChange(value){
    let params=this.state.params;
    params.end=this.state.params.end;
    params.start=this.state.params.start;
    params.event=value;
    params.metrics='event_user,event_count';
    this.loadData(params);

  }
  timeInit(){//初始化当前月份
    return [moment().startOf('month'),moment()];
  }
  loadData(params){//获得统计数据
    this.setState({loading:true,sumPV:0});
    console.log(params);
    request({
      type:'get',
      url:Config.host+'/api/admin/analytics/leancloud/appmetrics',
      data:params,
      success:data=>{
        let pv=[];
        let uv=[];
        let sumPv=0;
        let xAxis=Object.keys(data.result[0].data);
        data.result.forEach(item=>{
          if(item.metrics=="event_user"){
            for(let key in item.data){
              uv.push(item.data[key]);
            }
          }else{
            for(let key in item.data){
              pv.push(item.data[key]);
              sumPv+=item.data[key];
            }
          }
        });
        this.setState({loading:false,xAxis:xAxis,pv:pv,uv:uv,sumPv:sumPv,params:params});
      },
      error:()=>{
        message.error('数据加载失败')
      }
    });
  }
  componentDidMount(){
    let duration=this.timeInit();
    let params={
      end:duration[1],
      start:duration[0],
      event:"home",
      metrics:'event_user,event_count'
    };
    params.start = params.start.format('YYYYMMDD');
    params.end = params.end.format('YYYYMMDD');
    this.loadData(params);
  }
  render() {
    const RangePicker = DatePicker.RangePicker;
    let chartData={
      pv:this.state.pv,
      uv:this.state.uv,
      xAxis:this.state.xAxis,
      title:"首页",
    };
    return (
      <div className="statistics-component">
        <Row>
          <Col>
            <Select defaultValue="home" style={{ width: 120 }} onChange={this.handleChange.bind(this)}>
              <Option value="home">首页</Option>
              <Option value="list">产品列表</Option>
              <Option value="product">产品详情</Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col sm={{span:6,push:18}}>
            <RangePicker style={{ width: 184 }} onChange={this.onChange.bind(this)} defaultValue={this.timeInit()} format={dateFormat}/>
          </Col>
        </Row>
        <Spin spinning={this.state.loading} tip="正在读取数据...">
          <Row>
            <Chart option={this.getOption(chartData)} key ={Math.random()}/>
          </Row>
          <Row><p>PV:{this.state.sumPv}</p></Row>
        </Spin>
      </div>
    );
  }
}

StatisticsComponent.displayName = 'StatisticsComponent';

// Uncomment properties you need
// StatisticsComponent.propTypes = {};
// StatisticsComponent.defaultProps = {};

export default StatisticsComponent;
