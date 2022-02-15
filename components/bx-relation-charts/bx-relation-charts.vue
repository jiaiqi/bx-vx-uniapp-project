<template>
	<view class="chart-wrap">
		<!-- #ifdef APP-PLUS || MP-WEIXIN -->
		<mpvue-echarts class="ec-canvas" style="width: 100%;height:100%;" @onInit="onInit" canvasId="line" ref="normalChart" />
		<!-- #endif -->
		<!-- #ifdef H5 -->
		<div :id="chartId" style="width: 100%;height:100%;"></div>
		<!-- #endif -->
	</view>
</template>

<script>
import * as echarts from '@/components/echarts/echarts.min2.js';
// import * as echarts from '@/components/echarts/echarts.min.js';
import mpvueEcharts from '@/components/mpvue-echarts/src/echarts.vue';
export default {
	name: 'DietRecord',
	components: {
		mpvueEcharts
	},
	props: {
		chartId: {
			type: String,
			default: 're'
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
	mounted() {
		// #ifdef H5
		// 若在H5环境 使用官方版本echarts
		this.initChart();
		// #endif
	},
	methods: {
		initChart(e) {
			var originalData = [
				{
					name: '高血压',
					value: 0,
					symbol: 'roundRect',
					itemStyle: { color: '#f37b7b', borderColor: '#fff', borderWidth: 1 },
					label:{color:"#fff"},
					children: [
						{
							name: '肥胖',
							symbol: 'roundRect',
							value: 1,
							children: [
								{
									symbol: 'roundRect',
									name: '动脉血管舒张',
									value: 1
								},
								{
									symbol: 'roundRect',
									name: '高血糖',
									value: 1
								}
							]
						},
						{
							name: '饮酒',
							symbol: 'roundRect',
							value: 1
						},
						{
							name: '精神紧张',
							symbol: 'roundRect',
							value: 1
						},
						{
							name: '运动不足',
							symbol: 'roundRect',
							symbolSize:60,
							value: 1
						},
						{
							name: '饮食不健康',
							symbol: 'roundRect',
							value: 1
						}
					]
				}
			];
			var option = {
				type: 'tree',
				backgroundColor: '#fff',
				series: [
					{
						type: 'tree',
						hoverAnimation: true, //hover样式
						data: originalData,
						top: 80,
						bottom: 80,
						left: 0,
						right: 0,
						layout: 'orthogonal',
						orient: 'TB',
						symbol: 'circle',
						symbolSize: 50,
						nodePadding: 10,
						animationDurationUpdate: 750,
						expandAndCollapse: true, //子树折叠和展开的交互，默认打开
						// initialTreeDepth: 2,
						roam: 'scale', //是否开启鼠标缩放和平移漫游。scale/move/true
						focusNodeAdjacency: true,
						itemStyle: {
							color: '#f1f1f1',
							backgroundColor: '#f1f1f1',
							borderColor: '#333',
							borderWidth: 1
						},
						label: {
							//标签样式
							color: '#333',
							fontSize: 14,
							position: 'inside',
							rotate: 0
						},
						lineStyle: {
							width: 1,
							curveness: 0.5
						}
					}
				]
			};
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
			normalChart.setOption(option);
			this.$refs.normalChart.setChart(normalChart);
			// #endif
			// #ifdef H5
			// 若在H5环境 使用官方版本echarts

			const chartId = this.chartId;
			const myChart = echarts.init(document.getElementById(chartId));
			myChart.on('click', param => {
				//因为保存了对象同一引用，所以可以使用originalData快速找到目标对象
				console.log(param);
			});
			myChart.setOption(option, true);

			// #endif
		}
	}
};
</script>

<style scoped lang="scss">
.chart-wrap {
	height: 1000rpx;
	width: calc(100% - 20rpx);
	margin: 5px auto;
}
</style>
