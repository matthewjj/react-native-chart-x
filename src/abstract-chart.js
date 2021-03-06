import React, { Component } from 'react'
import {
  View, ScrollView, Text as RText
} from 'react-native'
import {
  Svg,
  LinearGradient,
  Line,
  Text,
  TSpan,
  Defs,
  Stop,
  G,
  Rect
} from 'react-native-svg'

class AbstractChart extends Component {

  minValue = 0;
  maxValue = 0;
  maximumRange = 0;
  negativeOffset = 0;

  calcYAxisRange = data => (Math.max(...data) - Math.min(...data)) || 1

  setStats = (data) => {
    
    let valueSet = [];
    data.map((dataset, index)=>{
      for(i = 0; i< dataset.data.length; i++) {
        
        valueSet.push(dataset.data[i])
      }

    });

    this.minValue = Math.min(...valueSet);
    this.maxValue = Math.max(...valueSet);
    this.maximumRange = this.maxValue + (this.minValue < 0 ? Math.abs(this.minValue) : 0);
    this.negativeOffset = this.negativeYAxisOffset(this.maximumRange, this.minValue);
    
    return true;
  }

  getMinValue = () => { 
    return this.minValue;
  }

  getMaximumRange = () => { 
    return this.maximumRange;
  }
  
  getNegativeOffset = () => {
    return this.negativeOffset;
  }

  yAxisLabels = (range, min) => { 
    var splitNumber = range.toString().split('.');
    var length = splitNumber[0].length
    var quartile = 0;
    var currentPoint = 0;
    var yLabels = [];

   
    console.log(this.minValue);
    console.log(length);
    
    //looking to get a 10 based axis for consistency
    quartile = Math.pow(10, length);

   

    //if one of the sections is bigger than the whole range then we can bring the scale down bearing in mind the min value has to fit
    if(range < quartile && this.minValue > (quartile * -1)) {
      //if we can step down a power of 10 and the data range be less than y axis range 
      if(range <= ((quartile / 10) * 4) && this.minValue > ((quartile / 10) * -1)) {
        quartile = (quartile / 10);

      }
      
      // and if one of the y axis sections is bigger than the range we can cut it further
      if(range <= quartile && this.minValue > ((quartile / 4) * -1)) {
        quartile = (quartile / 4);
      }
    
    }

    //if we have negative values
    if(this.minValue < 0) {

      console.log(range)

      this.negativeOffset = quartile;
      currentPoint = 0 - quartile;
    }

  
    var i=0;
    while(i < 5) {
      yLabels.push(currentPoint);
      currentPoint = currentPoint + quartile;
      i++;

    }
   
    return yLabels;

  }


  negativeYAxisOffset = (range, min) => { 
    let offset = 0;
    if(this.minValue < 0) {
      if(this.maxValue <= 200) {
          offset = 50;

      }
      else {
          offset = 100;

      }
    }

    return offset;

  }

  renderHorizontalLines = config => {
    var { count, width, height, paddingTop, paddingRight, data } = config

    var decimalPlaces = (this.props.chartConfig.decimalPlaces !== undefined) ? this.props.chartConfig.decimalPlaces : 2;
    
    var range = this.getMaximumRange();
    var yAxisLabels = this.yAxisLabels(range, this.minValue);
    
    count = yAxisLabels.length;
    
    return [...new Array(count)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={paddingRight.toString()}
          y1={((height / count * i) + paddingTop).toString()}
          x2={width.toString()}
          y2={((height / count * i) + paddingTop).toString()}
          stroke={this.props.chartConfig.color(0.2)}
          strokeDasharray="5, 10"
          strokeWidth="1"
        />
      )
    })
  }

  renderHorizontalLabels = config => {
    var { count, data, height, paddingTop, paddingRight, yLabelsOffset = 12 } = config
    var decimalPlaces = (this.props.chartConfig.decimalPlaces !== undefined) ? this.props.chartConfig.decimalPlaces : 2;
    
    let range = this.getMaximumRange();
    var yLabels = this.yAxisLabels(range, this.minValue);

    count = yLabels.length;

    return [...new Array(count)].map((_, i) => {
      return (
        <Text 
          key={Math.random()}
          x={(paddingRight - yLabelsOffset).toString()}
          textAnchor="end"
          y={((height / count * i) + paddingTop + 4).toString()}
          fontSize="11"
          fill={this.props.chartConfig.color(1)}
          strokeWidth="1"
        >
        <TSpan 
          key={Math.random()}
          x={(paddingRight - yLabelsOffset).toString()}
          textAnchor="end"
          y={((height / count * i) + paddingTop + 4).toString()}
          fontSize="11"
          fill={this.props.chartConfig.color(1)}
          strokeWidth="1" 

        >{(yLabels[count - i - 1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))}</TSpan>
      
    </Text>
      )



      return (
        <Text
          key={Math.random()}
          x={(paddingRight - yLabelsOffset).toString()}
          textAnchor="end"
          y={((height / count * i) + paddingTop + 4).toString()}
          fontSize="11"
          fill={this.props.chartConfig.color(0.5)}
          strokeWidth="1"
        >
        {(yLabels[count - i - 1].toLocaleString())}
        </Text>
      )

    })
  }

  renderVerticalLines = config => {
    const { data, width, height, paddingTop, paddingRight } = config
    return [...new Array(data.length)].map((_, i) => {
      return (
        <Line
          key={Math.random()}
          x1={(Math.floor((width - paddingRight) / data.length * (i) + paddingRight)).toString()}
          y1="0"
          x2={(Math.floor((width - paddingRight) / data.length * (i) + paddingRight)).toString()}
          y2={(height - (height / 4) + paddingTop).toString()}
          stroke={this.props.chartConfig.color(0.2)}
          strokeDasharray="5, 10"
          strokeWidth="1"
        />
      )
    })
  }

  renderVerticalLabels = config => {
    var { count, data, labels = [], width, height, paddingRight, paddingTop, horizontalOffset = 0 } = config
    const fontSize = 11

    var decimalPlaces = (this.props.chartConfig.decimalPlaces !== undefined) ? this.props.chartConfig.decimalPlaces : 2;
    let min = Math.min(...data).toFixed(decimalPlaces);

    let range = this.getMaximumRange();
    var yLabels = this.yAxisLabels(range, min);
    count = yLabels.length;

    //console.log(yLabels);
    if(this.props.chartConfig.tiltXAxis) {
      
      

      return labels.map((label, i) => {
        let labelSplit = label.split(" ")
        //console.log(height * (count - 1) / count) + paddingTop + (fontSize * 2);
        return (
          <G strokeWidth="1"
            key={Math.random()}
            x={((width - paddingRight) / labels.length * (i)) + paddingRight + horizontalOffset}
            y={(height * (count - 1) / count) + paddingTop + (fontSize * 2)}
          >
            <Text
              key={Math.random()}
              //x={((width - paddingRight) / labels.length * (i)) + paddingRight + horizontalOffset}
              //y={y}
              fontSize={fontSize}
              fill={this.props.chartConfig.color(1)}
              textAnchor="middle"
              strokeWidth="1"
              transform="translate(-10, 0) rotate(-45)"
            >
              {labelSplit[0]}
            </Text>

            {labelSplit[1] && 
              <Text
                key={Math.random()}
                //x={((width - paddingRight) / labels.length * (i)) + paddingRight + horizontalOffset}
                //y={y}
                fontSize={fontSize}
                fill={this.props.chartConfig.color(1)}
                textAnchor="middle"
                strokeWidth="1"
                transform="translate(10, 0) rotate(-45)"
            >

              {labelSplit[1]}
            </Text>


            }
          </G>
        )

      })


    }


    return labels.map((label, i) => {
      return (
        <Text
          key={Math.random()}
          x={((width - paddingRight) / labels.length * (i)) + paddingRight + horizontalOffset}
          y={(height * (count - 1) / count) + paddingTop + (fontSize * 2)}
          fontSize={fontSize}
          fill={this.props.chartConfig.color(0.5)}
          textAnchor="middle"
          strokeWidth="1"
        >{label}
        </Text>
      )
    })
  }

  renderLegend = config => {
    var { count, data, labels = [], width, height, paddingRight, paddingTop, horizontalOffset = 0 } = config
    const fontSize = 12
    let middle = [...new Array(data.length)].map((_, i) => {
      return (
       
         <G 
            key ={Math.random()}
            
          >

        <Text
          key={Math.random()}
          x={((width - paddingRight) / data.length * (i)) + paddingRight + horizontalOffset + 60}
          y={paddingTop}
          fontSize={fontSize}
          fill={this.props.chartConfig.color(0.5)}
          textAnchor="middle"
        >

          {data[i].name}
        </Text>

       
          <Rect
              x={((width - paddingRight) / data.length * (i)) + paddingRight + horizontalOffset}
              y={(paddingTop - 5).toString()}
              rx="0"
              ry="0"
              width={4}
              height="4"
              strokeWidth="2"
              stroke={
                  (data[i].color ? data[i].color(0.5) : 'white') 
                }
              fill="white"
             
            />

        </G>
        
      )
    })

    
    //return middle;
    return (
     <View key ={Math.random()}
      height={height}
          width={width}>
        <ScrollView
          horizontal={true}
           height={height}
          width={width}
        >
        <Svg key ={Math.random()}
          height={height}
          width={width}
        >
        {middle}
        </Svg>
        </ScrollView>
        </View>


      ) 

  }

  renderDefs = config => {
    const { width, height, backgroundGradientFrom, backgroundGradientTo } = config
    return (
      <Defs>
        <LinearGradient id="backgroundGradient" x1="0" y1={height.toString()} x2={width.toString()} y2="0">
          <Stop offset="0" stopColor={backgroundGradientFrom}/>
          <Stop offset="1" stopColor={backgroundGradientTo}/>
        </LinearGradient>
        <LinearGradient id="fillShadowGradient" x1="0" y1="0" x2="0" y2={height.toString()}>
          <Stop offset="0" stopColor={this.props.chartConfig.color()} stopOpacity="0.1"/>
          <Stop offset="1" stopColor={this.props.chartConfig.color()} stopOpacity="0"/>
        </LinearGradient>
      </Defs>
    )
  }
}

export default AbstractChart
