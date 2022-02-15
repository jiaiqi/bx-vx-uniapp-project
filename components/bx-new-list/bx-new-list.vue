<template>
	<view class="list-wrap">
		<view v-if="exampleInfo.length <= 0" class="no-data">
			<image src="/static/img/couopn.png" mode=""></image>
			<text class="none_text">暂无数据</text>
		</view>
		<hr-pull-load
			@refresh="refresh"
			@loadMore="loadMore"
			:height="height"
			:pullHeight="50"
			:maxHeight="100"
			:lowerThreshold="20"
			:bottomTips="bottomTips"
			:isTab="false"
			:isAllowPull="true"
			ref="hrPullLoad"
		>
			<view class="list">
				<view class="item" v-for="(item, index) of exampleInfo" :key="index"><slot name="listItem" :data="item"></slot></view>
			</view>
		</hr-pull-load>
	</view>
</template>

<script>
export default {
	data() {
		return {
			bottomTips: '',
			exampleInfo: [],
			currentPage: 1,
			colsV2Data: {},
			fields: []
		};
	},
	props: {
		list: {
			type: Array,
			default: () => []
		},
		height: {
			type: Number,
			default: -1
		},
		srvInfo: {
			type: Object,
			default: () => {
				return {
					serviceName: null,
					app: null,
					rownumber: 10
				};
			}
		}
	},
	created() {},
	mounted() {
		if (this.srvInfo && this.srvInfo.serviceName) {
			this.getFieldsV2().then(_ => {
				this.getListData(1);
			});
		}
	},
	methods: {
		async getFieldsV2() {
			let app = uni.getStorageSync('activeApp');
			console.log(this.srvInfo);

			let types = this.srvInfo.serviceName.substring(this.srvInfo.serviceName.lastIndexOf('_') + 1);
			let colVs = await this.getServiceV2(this.srvInfo.serviceName, types, 'list', this.srvInfo.app);
			if (!this.navigationBarTitle) {
				uni.setNavigationBarTitle({
					title: colVs.service_view_name
				});
			}
			if (colVs.more_config) {
				if (typeof colVs.more_config === 'string') {
					try {
						colVs.more_config = JSON.parse(colVs.more_config);
					} catch (e) {
						console.log(e);
					}
				}
			}
			this.colsV2Data = colVs;
			this.fields = colVs._fieldInfo;
			if (colVs._rowButtons) {
				this.$emit('getRowButton', colVs._rowButtons);
			} else {
				this.$emit('getRowButton', colVs.rowButton);
			}
		},
		/*
		 * 调用接口从后台获取数据，需要注意的是：
		 * 1.bottomTips用来控制触发加载更多时的底部提示
		 * 2.this.$refs.hrPullLoad.reSet()用来重置下拉刷新状态
		 */
		async getListData(type) {
			let _this = this;
			if (!this.srvInfo.serviceName || !this.srvInfo.app) {
				uni.showToast({
					title: 'serviceName参数错误,' + this.srvInfo.serviceName,
					icon: 'none'
				});
				// this.bottomTips = 'more';
			}
			let url = this.getServiceUrl(this.srvInfo.app, this.srvInfo.serviceName, 'select');
			let req = {
				serviceName: this.srvInfo.serviceName,
				colNames: ['*'],
				page: {
					pageNo: this.currentPage,
					rownumber: this.srvInfo.rownumber
				},
				condition: [
					{
						colName: 'store_no',
						ruleType: 'eq',
						value: uni.getStorageSync('realNameInfo').merchant ? uni.getStorageSync('realNameInfo').merchant.store_no : uni.getStorageSync('realNameInfo').employeeInfo.store_no
					}
				]
			};
			let res = await this.$http.post(url, req);
			if (res.data.state === 'SUCCESS') {
				let data = res.data.data;
				this.fields.forEach(field => {
					data.forEach(item => {
						Object.keys(item).forEach(key => {
							if (field.column === key) {
								item[key] = {
									label: field.label,
									value: item[key]
								};
							}
						});
					});
				});
				/* 拿到数据后的处理 */
				if (data.length > 0) {
					if (type == 1) {
						this.exampleInfo = data;
					} else if (type == 2) {
						this.exampleInfo = this.exampleInfo.concat(data);
					}
					// nomore’：没有更多数据了；‘loading’：加载中...；‘more’：上拉加载更多；
					if (data.length < this.srvInfo.rownumber) {
						this.bottomTips = 'nomore';
					} else {
						this.bottomTips = 'more';
					}
				} else {
					if (type == 1) {
						this.exampleInfo = [];
					} else if (type == 2) {
						this.currentPage--;
					}
					this.bottomTips = 'nomore';
				}
				setTimeout(() => {
					/* 这里300毫秒的延时，主要是为了优化视觉效果 */
					this.$refs.hrPullLoad.reSet();
				}, 300);
			}
		},
		//自定义上拉加载更多
		loadMore() {
			this.currentPage++;
			this.bottomTips = 'loading';
			this.getListData(2);
		},
		//自定义下拉刷新
		refresh() {
			this.currentPage = 1;
			this.getListData(1);
		}
	}
};
</script>

<style lang="scss" scoped>
.no-data {
	height: calc(100vh - 100rpx);
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	image {
		width: 100rpx;
		height: 100rpx;
	}
	.none_text {
		color: #cccccc;
		margin-top: 10rpx;
	}
}
.list-wrap {
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
}
</style>
