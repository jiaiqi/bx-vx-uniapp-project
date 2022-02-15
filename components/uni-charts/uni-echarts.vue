<template>
  <view class="chart-wrap">
    <!-- #ifdef APP-PLUS || MP-WEIXIN -->
    <mpvue-echarts class="ec-canvas" @onInit="onInit" canvasId="line" ref="normalChart" />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <div :id="chartId" style="width: 100%;height:100%;"></div>
    <!-- #endif -->
  </view>
</template>

<script>
import * as echarts from '@/components/echarts/echarts.min.js';
import mpvueEcharts from '@/components/mpvue-echarts/src/echarts.vue';
export default {
  name: 'DietRecord',
  components: {
    mpvueEcharts
  },
  props: {
    chartId: {
      type: String,
      default: ''
    },
    chartOption: {
      type: Object,
      default: ()=>{}
    },
  },
  data() {
    return {
      echarts,
      onInit: this.initChart,
      // chartOption: {
      //   legend: {
      //     data: ['牛奶', '鸡蛋', '面包'],
      //     show: true
      //   },
      //   grid: {
      //     left: '3%',
      //     right: '4%',
      //     bottom: '3%',
      //     containLabel: true
      //   },
      //   xAxis: {
      //     type: 'category',
      //     data: ['蛋白', '维C', '铁', '锌', '钙', '热量']
      //   },
      //   yAxis: {
      //     type: 'value'
      //   },
      //   series: [
      //     {
      //       name: '牛奶',
      //       type: 'bar',
      //       stack: '总量',
      //       label: {
      //         normal: {
      //           show: false
      //         }
      //       },
      //       data: [320, 302, 301, 334, 390, 330]
      //     },
      //     {
      //       name: '鸡蛋',
      //       type: 'bar',
      //       stack: '总量',
      //       label: {
      //         normal: {
      //           show: false
      //         }
      //       },
      //       data: [120, 132, 101, 134, 90, 230]
      //     },
      //     {
      //       name: '面包',
      //       type: 'bar',
      //       stack: '总量',
      //       label: {
      //         normal: {
      //           show: false
      //         }
      //       },
      //       data: [220, 182, 191, 234, 290, 330]
      //     },
      //     {
      //       name: '平均',
      //       type: 'line',
      //       label: {
      //         normal: {
      //           show: true
      //         }
      //       },
      //       data: [145, 255, 342, 156, 290, 654]
      //     }
      //   ]
      // }
    };
  },
  mounted() {
    // #ifdef H5
    // 若在H5环境 使用官方版本echarts
    this.initChart();
    // #endif
  },
  methods: {
    initChart(e) {
      // #ifdef APP-PLUS||MP-WEIXIN
      // 若在小程序或APP环境 使用官方版本mpvue-echarts
      let { width, height } = e;
      let canvas = this.$refs.normalChart.canvas;
      echarts.setCanvasCreator(() => canvas);
      let normalChart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(normalChart);
      normalChart.setOption(this.chartOption);
      this.$refs.normalChart.setChart(normalChart);
      // #endif
      // #ifdef H5
      // 若在H5环境 使用官方版本echarts
      const chartId = this.chartId
      const myChart = echarts.init(document.getElementById(chartId));
      myChart.setOption(this.chartOption);
      // #endif
    }
  }
};
</script>

<style>
.chart-wrap {
  height: 100%;
}
</style>
