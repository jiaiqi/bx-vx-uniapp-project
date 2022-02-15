<template>
	<view class="content">
		<!-- #ifdef APP-PLUS || H5  -->
		<!-- <canvas :id="chartId" :width="width" :height="height"></canvas> -->
		<view :id="chartId + '-box'"></view>
		<!-- #endif -->
		<!-- #ifndef APP-PLUS || H5 -->
		<view>非 APP、H5 环境不支持</view>
		<!-- #endif -->
	</view>
</template>

<script module="f2" lang="renderjs">
import { ref, reactive, onMounted } from '@vue/composition-api';
import F2 from './f2.js'
let myChart
export default {
	props: {
		chartId: {
			type: String,
			require:true,
			default: ""
		},
		type:{
			type: String,
			require:true,
			default: ""
		},
		width:{
			type:String,
			default:"400"
		},
		height:{
			type:String,
			default:"260"
		},
		data:{
			type:Array,
			require:true,
		},
		initF2:{
			type:Function
		}
	},
	setup(props){
		function initF2(props){
			// renderjs 里可以自由操作 window 、dom等浏览器环境属性
				const chart = new F2.Chart({
					id: props.chartId,
					pixelRatio: window.devicePixelRatio, // 指定分辨率
				});
				const data = [{
					year: '1951 年',
					sales: 38
				}, {
					year: '1952 年',
					sales: 52
				}, {
					year: '1956 年',
					sales: 61
				}, {
					year: '1957 年',
					sales: 145
				}, {
					year: '1958 年',
					sales: 48
				}, {
					year: '1959 年',
					sales: 38
				}, {
					year: '1960 年',
					sales: 38
				}, {
					year: '1962 年',
					sales: 38
				}];
				// Step 2: 载入数据源
				chart.source(data);

				// Step 3：创建图形语法，绘制柱状图，由 genre 和 sold 两个属性决定图形位置，genre 映射至 x 轴，sold 映射至 y 轴
				// chart.interval().position('genre*sold').color('genre');
				chart.line().position('year*sales');
				chart.render();
			}
			// Step 4: 渲染图表
			onMounted(()=>{
				const container = document.getElementById(props.chartId+'-box')
				// 创建 html5 canvas DOM
				const canvas = document.createElement('canvas')
				// id 不可重复
				canvas.id = props.chartId
				canvas.width = uni.upx2px(props.width)
				canvas.height = uni.upx2px(props.height)
				container.appendChild(canvas)
				initF2(props)
			})
	},
}
</script>

<style>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #fff;
}
</style>
