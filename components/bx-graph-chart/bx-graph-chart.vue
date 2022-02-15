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
			var option = {
				xAxis: {
					show: false,
					type: 'value'
				},
				yAxis: {
					show: false,
					type: 'value'
				},
				tooltip: {
					formatter: '{b}'
				},
				series: [
					{
						type: 'graph',
						layout: 'none',
						edgeSymbol: ['circle', 'arrow'],
						edgeSymbolSize: [0, 20],
						edgeLabel: {
							normal: {
								show: true,
								position: 'middle',
								textStyle: {
									fontSize: 14
								},
								formatter: '{c}次'
							}
						},
						zoom: 0.9,
						focusNodeAdjacency: true, // 指定的节点以及其所有邻接节点高亮
						roam: false, // 是否可拖拽
						lineStyle: {
							normal: {
								width: 2,
								shadowColor: 'none',
								color: '#142F54',
								curveness: 0.1
							}
						},
						symbolSize: [100, 70],
						symbol: 'roundRect',
						label: {
							show: true,
							formatter: function(params) {
								let c = params.data.username || '';
								let b = params.data.name;
								var str = '';
								if (c === '') {
									str = '{p|' + b + '}';
								} else {
									str = '{n|' + c + '}\n{p|' + b + '}';
								}
								return str;
							},
							rich: {
								p: {
									fontSize: 14,
									color: '#142F54',
									align: 'center'
								},
								n: {
									height: 25,
									fontSize: 16,
									color: '#142F54',
									align: 'center'
								}
							}
						},
						itemStyle: {
							normal: {
								color: '#F2F2F2',
								borderColor: '#707070',
								borderWidth: 2,
								shadowColor: 'rgba(225,225,225,0.4)',
								shadowBlur: 10,
								shadowOffsetX: 10,
								shadowOffsetY: 10
							}
						},
						data: [
							{
								import: true,
								level: 'first',
								username: '高血压',
								name: '15625698563',
								itemStyle: {
									normal: {
										color: '#EE6F0B'
									}
								},
								x: 0,
								y: 0
							},
							{
								import: false,
								level: 'sconed',
								username: '李宏伟',
								name: '17825690251',
								x: -200,
								y: 100
							},
							// {
							// 	import: false,
							// 	level: 'sconed',
							// 	// username: "访问时间2",
							// 	name: '15569865236',
							// 	x: 200,
							// 	y: 100
							// },
							// {
							// 	import: false,
							// 	level: 'third',
							// 	// username: "目的端IP1",
							// 	name: '13256981457',
							// 	x: -100,
							// 	y: 200
							// },
							// {
							// 	import: true,
							// 	level: 'third',
							// 	username: '张磊',
							// 	name: '17814589651',
							// 	itemStyle: {
							// 		normal: {
							// 			color: '#EE6F0B'
							// 		}
							// 	},
							// 	x: 100,
							// 	y: 200
							// }
						],

						links: [
							{
								source: '15625698563',
								value: '5165 ',
								target: '17825690251'
							},
							{
								source: '17825690251',
								value: '5165 ',
								target: '15625698563'
							},
							{
								source: '15625698563',
								value: '5165 ',
								target: '15569865236'
							},
							{
								source: '15569865236',
								value: '5165 ',
								target: '13256981457'
							},
							{
								source: '17825690251',
								value: '5165 ',
								target: '13256981457'
							},
							{
								source: '17825690251',
								value: '5165 ',
								target: '17814589651'
							},
							{
								source: '15569865236',
								value: '5165 ',
								target: '17814589651'
							}
						]
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
