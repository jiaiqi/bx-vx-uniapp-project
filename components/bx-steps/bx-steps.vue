<template>
	<view class="bg">
		<view class="cu-timeline" style="width: 100vw;">
			<view class="cu-time step-title">{{procName || ''}}</view>
			<view class="cu-item cur " v-for="(i, index) in infoList" :key="index"
				:class="i.state === '已处理' ? 'text-green' : i.state === '正在处理' || i.state === '重新处理' ? 'text-blue' : i.state === '未开始' ? 'text-gray' : i.state === '回退' ? 'text-red' : 'text-gray' ">
				<view class="content shadow-blur"
					:class="i.state === '已处理' ? 'bg-green' : i.state === '正在处理'  || i.state === '重新处理' ? 'bg-blue' : i.state === '未开始' ? 'bg-gray' : i.state === '回退' ? 'bg-red' : 'bg-gray' "
					@tap="topage({ data: i, index: index })">
					<view class="flex justify-between">
						<text v-if="i._record_data">{{i._record_data.create_time}}</text>
						<text v-if="i.state === '已处理' && i.biz_cfg_data.length > 0 "
							class="lg text-white cuIcon-more"></text>
					</view>
					<view class="head">
						<view class="name text-cut">{{ i.step_name }}</view>
					</view>
					<view class="state text-cut">状态：{{ i.state }}
					</view>
					<view class="state" v-if="i._approval_user">
						责任人：
						<text class="">{{ i._approval_user }}</text>
					</view>
					<view class="text-cut" v-if="i._record_data">
						<text class="margin-right-xs">处理时间：</text>
						{{ i._record_data.create_time }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'YSteps',
		props: {
			infoList: {
				type: Array,
				default: () => {
					[];
				}
			},
			scroll: {
				type: Number,
				default: -1
			},
			color: {
				type: String,
				default: '#ff3838'
			},
			procName: {
				type: String,
				default: ""
			}
		},
		methods: {
			topage(e) {
				this.$emit('clickSteps', e);
			}
		}
	};
</script>

<style lang="scss">
	@keyframes info {
		0% {
			transform: translate(100px, 0);
		}

		60% {
			transform: translate(-10px, 0);
		}

		100% {
			transform: translate(0, 0);
		}
	}

	page {
		background-color: #f2f2f2;
	}

	.step-title {
		width: 100%;
		text-align: left;
		margin-left: 10px;
	}

	.bg {
		margin-top: 20upx;
		background-color: #f2f2f2;
		display: flex;

		.bg-green {
			background-color: rgba(59, 195, 40, 0.92) !important;
		}
	}

	.steps {
		display: flex;
		flex-direction: column;
		width: 60upx;
		margin: 0 30upx;
		margin-top: 100upx;

		.steps_item {
			display: flex;
			flex-direction: column;
			align-items: center;

			view {
				height: 200upx;
				width: 5upx;
			}

			text {
				display: flex;
				flex-direction: column;
				align-items: center;
				width: 40upx;
				line-height: 40upx;
				height: 40upx;
				border-radius: 50%;
				font-size: 10px;
			}
		}
	}

	.info_list {
		display: flex;
		flex-direction: column;
		flex: 1;

		.info_item {
			// background-color: #fff;
			height: 200upx;
			margin: 20upx 0;
			margin-right: 30upx;
			border-radius: 10upx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			padding: 0 30upx;
		}

		.info_item:active {
			opacity: 0.6;
		}

		.content-box {
			.head {
				display: flex;
				flex-direction: row;
			}

			.name {
				flex: 1;
				font-size: 34upx;
				line-height: 60upx;
				font-weight: 700;
			}

			.state {
				flex: 1;
				font-size: 30upx;
				line-height: 60upx;
			}
		}
	}
</style>
