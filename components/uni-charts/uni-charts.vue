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
// import * as echarts from '@/components/echarts/echarts1.js';
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
			default: () => {}
		}
	},
	data() {
		return {
			echarts,
			onInit: this.initChart
		};
	},
	watch: {
		chartOption: {
			deep: true,
			handler(newValue, oldValue) {
				// #ifdef H5
				// 若在H5环境 使用官方版本echarts
				this.initChart();
				// #endif
			}
		}
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
			const chartId = this.chartId;
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
	background-color: #fff;
}
</style>
