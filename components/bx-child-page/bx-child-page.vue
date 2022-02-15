<template>
	<view>
		<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
			<view class="cu-item" :class="index==TabCur?'text-green cur':''" v-show="getChildExp(mainData,null,item)"
				v-for="(item,index) in tabConfig" :key="index" @tap="tabSelect(item,index)" :data-id="index">
				{{item._v2Data.hasOwnProperty('foreign_key') ? item._v2Data.foreign_key.section_name : item.title|handleTabName(colsV2Data)}}
			</view>
		</scroll-view>
		<view v-show="0==TabCur">
			<bx-list
				v-if="(listType&&listType.indexOf('list')!==-1|| pageType&&pageType.indexOf('list')!==-1)&&colsV2Data&&colsV2Data.service_name"
				:appno="appno" useDataHeight :showPagination="false" :ref="'bxList'"
				:serviceName="colsV2Data.service_name" :condition="colsV2Data.condition"
				:relation_condition="relation_condition" :pageType="pageType"
				:listType="pageType=='proc'?pageType:'list'" :procInstanceNo="procInstanceNo"
				:rowButtons="colsV2Data.rowButton" :handerButtons="colsV2Data.handerButtons" :showTab="false"
				:enablePullDown="true" :enablePullUp="false" :listConfig="listConfig" :showButton="showRowButton"
				:heightStyle="'50vh'" :fixed="false" :v2Datas="colsV2Data" :top="listTop" :searchWords="searchVal"
				:referencedColName="getReferencedColumnName(colsV2Data)" :searchColumn="keyColumn" :tempWord="tempWord"
				:rownumber="10" :childMainData="mainData" :showFootBtn="showFootBtn" @list-change="listChange"
				@clickFootBtn="clickFootBtn" @handerBtnClick="handerBtnClick" @loadEnd="loadEnd"></bx-list>
			<bxform ref="bxDetailForm" :pageType="pageType" :appno="appno" :procData="mainData" :childDatas="childDatas"
				:BxformType="pageType" :fields="fields" v-else></bxform>
		</view>
		<view v-show="index == TabCur && child.type === 'child' && getChildExp(mainData,null,child)"
			v-for="(child,index) in tabConfig">
			<bx-list :ref="'bxList'+index" v-if="child.type === 'child'" :showPagination="false"
				:serviceName="child.serviceName" :condition="child.condition" :relation_condition="relation_condition"
				:pageType="'list'" :listType="'list'" :rowButtons="child._v2Data.rowButton"
				:handerButtons="child._v2Data.handerButtons" :showTab="false" :viewTemp="viewTemp"
				:listConfig="listConfig" :showButton="showRowButton" :heightStyle="heightStyle" :fixed="false"
				:v2Datas="child._v2Data" :top="listTop" :searchWords="searchVal"
				:referencedColName="getReferencedColumnName(child._v2Data)" :searchColumn="keyColumn"
				:tempWord="tempWord" :rownumber="10" :childMainData="mainData" :submintType="child.submintType"
				:showFootBtn="showFootBtn" @list-change="listChange" @clickFootBtn="clickFootBtn" :appno="appno"
				@handerBtnClick="handerBtnClick" @loadEnd="loadEnd"></bx-list>
		</view>
	</view>
</template>

<script>
	import bxform from '@/components/bx-form/bx-form.vue';
	import bxList from '@/components/bx-list/bx-list.vue';
	export default {
		components: {
			bxform,
			bxList
		},
		filters: {
			handleTabName: function(value, colsV2Data) {
				if (colsV2Data) {
					if (colsV2Data.use_type && colsV2Data.use_type === 'detail') {
						return value.substr(0, value.length - 2) + '详情';
					} else if (colsV2Data.use_type.indexOf('list') !== -1) {
						return value.substr(0, value.length - 2) + '列表';
					}
				}
				return value;
			}
		},
		props: {
			pageType: {
				type: String,
				default: ''
			},
			selectServiceName: {
				type: String,
				default: ''
			},
			addServiceName: {
				type: String,
				default: ''
			},
			updateServiceName: {
				type: String,
				default: ''
			},
			pageMainServiceName: {
				type: String,
				default: ''
			},
			mainData: {
				type: Object,
				default () {
					return {}
				}
			},
			procInstanceNo: {
				type: String
			},
			listType: {
				type: String,
			},
			appno: {
				// 特殊app
				type: String
			},
			feature: {
				type: String,
				default: 'common'
			}
		},
		data() {
			return {
				index: 0,
				TabCur: 0,
				scrollLeft: 0,
				colsV2Data: null,
				fields: [],
				defaultCondition: [],
				params: {},
				addType: '',
				fieldsCond: [], //treeSelector类型字段的条件
				serviceName: '',
				placeholder: '输入搜索关键词',
				listConfig: {},
				srv_cols: [],
				condition: [],
				relation_condition: null,
				pattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF'
				},
				fabContent: [],
				fabHorizontal: 'left',
				fabVertical: 'bottom',
				fabDirection: 'horizontal',
				listTop: 5,
				showRowButton: 'true',
				viewTemp: {
					// title: 'name',
					// tip: 'desc',
					// img: 'img',
					// price: 'current_price',
					// footer: 'shop_name'
				},
				heightStyle: "50vh",
				publicButton: [],
				searchVal: '',
				keyColumn: '',
				showAdd: false,
				noData: false,
				showSearchBar: false,
				showFootBtn: true,
				tempWord: {},
				queryParams: {},
				queryOption: {},
				navigationBarTitle: null
			};
		},
		created() {
			this.getFieldsV2()
		},
		computed: {
			childDatas: function() {
				return this.getChildDatas()
			},
			"tabConfig": function() {
				let self = this
				let config = {
					serviceName: "",
					defaultCondition: [],
					title: "",
					type: "",
					pageType: ""
				}
				let configs = []
				let main = self.deepClone(config)
				main['serviceName'] = self.selectServiceName
				if (self.colsV2Data) {
					main['title'] = self.colsV2Data.service_view_name
					main['type'] = "main"
					main['pageType'] = self.selectServiceName
					main['_v2Data'] = self.deepClone(self.colsV2Data)
					main['foreign_key'] = main['_v2Data'].foreign_key
					main['condition'] = [{
						"colName": "parent_proc_instance_no",
						"ruleType": "eq",
						"value": self.procInstanceNo
					}]
					configs.push(main)
					if (self.colsV2Data.child_service && self.colsV2Data.child_service.length > 0) {
						let childSrv = self.colsV2Data.child_service
						childSrv.forEach((item) => {
							let obj = self.deepClone(config)
							obj['serviceName'] = item.service_name
							obj['title'] = item.service_view_name
							obj['type'] = "child"
							obj['submintType'] = self.pageType == 'update' || self.pageType == 'add' ? 'men' :
								'db'
							obj['pageType'] = item.foreign_key.view_model
							obj['condition'] = self.getForKeyCond(this.mainData, item.foreign_key)
							obj['_v2Data'] = self.deepClone(item)
							configs.push(obj)
						})
					}
				}

				return configs

			}

		},
		methods: {
			getReferencedColumnName(item) {
				let keyCol = ''
				if (item.hasOwnProperty('foreign_key') && item.foreign_key.hasOwnProperty("referenced_column_name") && item
					.foreign_key.referenced_column_name) {
					keyCol = item.foreign_key.referenced_column_name
				}
				return keyCol
			},
			getChildExp(main, row, config) {
				let mainData = main
				let rows = row
				let configs = config
				let isShow = true
				let showExps = null
				if (config && config.hasOwnProperty('_v2Data') && config.type == 'child') {
					let showUi = config._v2Data.foreign_key.show_ui_child_table == '是' ? true : false
					showExps = config._v2Data.foreign_key.show_child_list_expr
					if (showExps) {
						if (showExps !== null && showExps.startsWith("{{") && showExps.endsWith("}}")) {
							// for expr 
							showExps = showExps.replace("{{", "").replace("}}", "");
						}
						let testFun = new Function('e',
							`let mainData = e ;let row = e;let data = row; return (${showExps})`)
						isShow = testFun(mainData)
					}
				}
				console.log("getChildExp", main, row, config)



				return isShow
			},
			getFieldModel() {
				let mode = this.$refs.bxDetailForm.getFieldModel()
				if (mode === false) {
					return false
				} else {
					mode = mode ? mode : {}
				}
				mode['child_data_list'] = this.getChildModel()
				return mode
			},
			getChildDatas() {
				let self = this
				let list = self.tabConfig
				let childDatas = {}
				for (let i = 0; i < list.length; i++) {
					if (list[i].pageType === 'list') {
						let name = 'bxList' + i
						if (Array.isArray(self.$refs[name])) {
							let temp = self.$refs[name][0].getMenDataModels('dbData')
							let lists = self.$refs[name][0].menListData
							childDatas[list[i].serviceName] = [...temp, ...lists]
							if (list[i]._v2Data?.foreign_key?.constraint_name) {
								childDatas[list[i]?._v2Data?.foreign_key?.constraint_name] = [...temp, ...lists]
							}
						}
					}
				}
				return childDatas
			},
			getChildModel() {
				let self = this
				let req = new Array
				let list = self.tabConfig
				for (let i = 0; i < list.length; i++) {
					if (list[i].pageType === 'list') {
						let name = 'bxList' + i
						let temp = self.$refs[name].length > 0 ? self.$refs[name][0].getMenDataModels('menModel') : {}
						req = req.concat(temp)
					}
				}
				return req
			},
			tabSelect(e, index) {
				console.log(e)
				this.TabCur = index;
				this.scrollLeft = (index - 1) * 60
			},
			listChange(e) {
				// debugger
				if (this.$refs.bxDetailForm) {
					let mode = this.$refs.bxDetailForm.getFieldModel()
					// 进行子表冗余计算
					// debugger
					this.$refs.bxDetailForm.handleRedundant({
						childDatas: this.childDatas
					})
				}
				console.log('listChange:', e, this.childDatas);
			},
			loadEnd(e) {
				if (!e || !e.total) {
					this.noData = true;
					this.heightStyle = 0
				}
			},
			handerBtnClick(e) {
				console.log('handerBtnClick', e)
			},
			async clickFootBtn(data) {
				let buttonInfo = data.button;
				let rowData = data.row;
				if (buttonInfo.operate_params && typeof buttonInfo.operate_params === 'string') {
					try {
						buttonInfo.operate_params = JSON.parse(buttonInfo.operate_params);
						if (Array.isArray(buttonInfo.operate_params.condition) && buttonInfo.operate_params.condition
							.length > 0) {
							buttonInfo.operate_params.condition.forEach(cond => {
								if (typeof cond.value === 'object' && cond.value.value_type === 'rowData') {
									cond.value = data.row[cond.value.value_key];
								} else if (typeof cond.value === 'object' && cond.value.value_type ===
									'constant') {
									cond.value = cond.value.value;
								}
							});
						}
						if (Array.isArray(buttonInfo.operate_params.data) && buttonInfo.operate_params.data.length >
							0) {
							buttonInfo.operate_params.data.forEach(data => {
								if (typeof data === 'object') {
									Object.keys(data).forEach(item => {
										if (typeof data[item] === 'object' && data[item].value_type ===
											'rowData') {
											data[item] = rowData[data[item].value_key];
										} else if (typeof data[item] === 'object' && data[item]
											.value_type === 'constant') {
											data[item] = data[item].value;
										}
									});
								}
							});
						}
						if (buttonInfo.operate_type === '操作' && buttonInfo.operate_mode === '静默操作') {
							let req = [{
								serviceName: buttonInfo.operate_service,
								condition: buttonInfo.operate_params.condition,
								data: buttonInfo.operate_params.data
							}];
							let app = this.appno || uni.getStorageSync('activeApp');
							let url = this.getServiceUrl(buttonInfo.application ? buttonInfo.application : app,
								buttonInfo.operate_service, buttonInfo.servcie_type);
							debugger
							let res = await this.$http.post(url, req);
							if (res.data.state === 'SUCCESS') {
								this.$refs.bxList.onRefresh();
							}
						} else if (buttonInfo.operate_type === '更新弹出') {
							let params = {
								type: buttonInfo.servcie_type,
								serviceName: buttonInfo.operate_service,
								defaultVal: {}
								// eventOrigin: buttonInfo
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?serviceName=' +
									buttonInfo.operate_service +
									'&type=' +
									buttonInfo.servcie_type +
									'&cond=' +
									decodeURIComponent(JSON.stringify(buttonInfo.operate_params.condition))
							});
						}
					} catch (e) {
						console.error(e);
						//TODO handle the exception
					}
				}

				if (this.pageType === 'proc') {
					if (data.button && data.button.button_type === 'edit' && data.row.proc_instance_no) {
						uni.navigateTo({
							url: '/pages/public/proc/procDetail/procDetail?proc_instance_no=' + data.row
								.proc_instance_no
								.proc_instance_no
						});
					}
				} else {
					this.onButtonToUrl(data).then(res => {
						if (data.button && data.button.button_type === 'delete') {
							if (res.state === 'SUCCESS') {
								this.$refs.bxList.onRefresh();
							}
						}
						if (data.button && data.button.button_type === 'detail') {
							let row = res.row;
							let btn = res.button;
							let params = {
								type: 'detail',
								condition: [{
									colName: 'id',
									ruleType: 'in',
									value: row.id
								}],
								serviceName: btn.service_name,
								defaultVal: row
							};
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
							});
						} else if (data.button && data.button.button_type === 'customize') {
							let moreConfig = data.button.more_config;
							if (typeof moreConfig === 'string') {
								try {
									moreConfig = JSON.parse(moreConfig);
								} catch (e) {
									//TODO handle the exception
									console.log(e);
								}
							}
							if (data.button.servcie_type === 'add') {
								let params = {
									type: 'add',
									serviceName: res.button.service_name,
									defaultVal: res.row,
									eventOrigin: res.button
								};
								if ((data.button.main_table = 'bxzhxq_member' && data.button
										.operate_service === 'srvzhxq_syrk_add')) {
									params.cond = [{
										colName: 'fwbm',
										ruleType: 'condition',
										value: [{
												colName: 'dybm',
												ruleType: 'eq',
												value: 'dybm'
											},
											{
												colName: 'lybm',
												ruleType: 'eq',
												value: 'lybm'
											}
										]
									}];
								}
								uni.navigateTo({
									url: '/pages/public/formPage/formPage?params=' + JSON.stringify(
										params)
								});
							} else if (data.button.servcie_type === 'select') {
								let params = {
									type: 'select',
									serviceName: res.button.service_name,
									defaultVal: res.row,
									eventOrigin: res.button
								};
								//
								if ((data.button.main_table = 'bxzhxq_member' && data.button
										.operate_service === 'srvzhxq_syrk_select')) {
									params.cond = [{
										colName: 'fwbm',
										ruleType: 'condition',
										value: [{
												colName: 'dybm',
												ruleType: 'eq',
												value: 'dybm'
											},
											{
												colName: 'lybm',
												ruleType: 'eq',
												value: 'lybm'
											}
										]
									}];
								}
								// uni.navigateTo({
								// 	url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
								// });
								if (data.button.button_name === '绑定房屋') {
									if (data.row.person_no) {
										let urls = this.getServiceUrl('zhxq', 'srvzhxq_syrk_select', 'select');
										let reqs = {
											serviceName: 'srvzhxq_syrk_select',
											colNames: ['*'],
											condition: [{
													colName: 'is_fuzeren',
													ruleType: 'eq',
													value: '是'
												},
												{
													colName: 'openid',
													ruleType: 'eq',
													value: uni.getStorageSync('login_user_info')
														.user_no
												},
												{
													colName: 'status',
													ruleType: 'eq',
													value: '有效'
												}
											],
											order: [{
												colName: 'create_time',
												orderType: 'asc'
											}]
										};
										this.$http.post(urls, reqs).then(rData => {
											if (rData.data.data.length > 0) {
												uni.navigateTo({
													url: `/pages/public/list/list?serviceName=srvzhxq_syrk_select&pageType=list&params=${JSON.stringify(
														params
													)}&viewTemp={"title":"_fwbm_disp","img":"zp","tip":"xm","footer":"gmsfhm"}&navigationBarTitle=房屋信息&showRowButton=true&cond=[{"colName":"person_no","ruleType":"like","value":"${
														data.row.person_no
													}"},{"colName":"proc_status","ruleType":"eq","value":"完成"},{ "colName": "status", "ruleType": "eq", "value": "有效" }]`
												});
											} else {
												uni.showToast({
													title: '非房屋负责人不可进行此操作',
													duration: 1000,
													icon: 'none'
												});
											}
										});
									} else {
										uni.navigateTo({
											url: `/pages/public/list/list?serviceName=srvzhxq_syrk_select&pageType=list&navigationBarTitle=房屋信息&params=${JSON.stringify(
												params
											)}&viewTemp={"title":"_fwbm_disp","img":"zp","tip":"xm","footer":"gmsfhm"}&showRowButton=true&cond=[{"colName":"openid","ruleType":"like","value":"${
												data.row.openid
											}"},{"colName":"proc_status","ruleType":"eq","value":"完成"},{ "colName": "status", "ruleType": "eq", "value": "有效" }]`
										});
									}
								} else {
									uni.navigateTo({
										url: '/pages/public/list/list?serviceName=srvzhxq_syrk_select&pageType=list&viewTemp={"title":"_fwbm_disp","tip":"fwyt","footer":"rylx"}&cond=[{"colName":"is_fuzeren","ruleType":"like","value":"是"},{"colName":"openid","ruleType":"like","value":"user_no"}]'
									});
								}
							}
						} else if (data.button.servcie_type === 'add') {
							let params = {
								type: 'add',
								serviceName: res.button.service_name,
								defaultVal: res.row,
								eventOrigin: res.button
							};
							if ((data.button.main_table = 'bxzhxq_member' && data.button.operate_service ===
									'srvzhxq_syrk_add')) {
								params.cond = [{
									colName: 'fwbm',
									ruleType: 'condition',
									value: [{
											colName: 'dybm',
											ruleType: 'eq',
											value: 'dybm'
										},
										{
											colName: 'lybm',
											ruleType: 'eq',
											value: 'lybm'
										}
									]
								}];
							}
							uni.navigateTo({
								url: '/pages/public/formPage/formPage?params=' + JSON.stringify(params)
							});
						} else if (data.button && data.button.operate_type === '流程申请') {
							uni.navigateTo({
								url: '/pages/public/proc/apply/apply?serviceName=' + data.button
									.operate_service
							});
						}
					});
				}
			},
			async getListV2() {
				let app = this.appno || uni.getStorageSync('activeApp');
				// let app = uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(self.selectServiceName, null, self.pageType, app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				console.log('colVs', colVs);
				self.listConfig = colVs;
				if (this.pageType === 'proc') {
					this.showFootBtn = false;
				}
				this.publicButton = colVs.gridButton.filter(item => {
					if (item.permission === true) {
						switch (item.button_type) {
							case 'add':
							case 'apply':
								this.showAdd = true;
								return item;
								break;
							case 'select':
								this.showSearchBar = true;
								// #ifdef MP-WEIXIN
								this.listTop = 100;
								// #endif
								return item;
								break;
							case 'customize':
								if (item.application === 'zhxq' && item.button_name === '住户录入') {
									if (self.queryOption && self.queryOption.hasOwnProperty('showAdd')) {
										self.showAdd = self.queryOption.showAdd === 'false' ? false : self
											.queryOption.showAdd == 'true' ? true : self.queryOption.showAdd;
									} else {
										self.showAdd = true;
									}
									return item;
								}
						}
					}
				});
				return colVs;
			},
			async getDefaultVal(condition) {
				if (this.pageType === 'detail' || this.pageType === 'update') {
					// let app = uni.getStorageSync('activeApp');
					let app = this.appno || uni.getStorageSync('activeApp');
					let url = this.getServiceUrl(app, this.selectServiceName, 'select');
					let req = {
						serviceName: this.selectServiceName,
						colNames: ['*'],
						condition: this.params.condition ? this.params.condition : [],
						page: {
							pageNo: 1,
							rownumber: 10
						}
					};
					if (Array.isArray(condition) && condition.length > 0) {
						req.condition = condition;
					}
					let res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						if (Array.isArray(res.data.data) && res.data.data.length > 0) {
							return res.data.data[0];
						}
					}
				}
			},
			getChildV2: async function(srv, page, pageType, app) {
				let self = this
				return new Promise((resolve, reject) => {
					let colVs = self.getServiceV2(srv, page, pageType, app);
					if (colVs) {
						resolve(colVs)
					}
				})
			},

			getFieldsV2: async function() {
				let self = this
				console.log('child page getFieldsV2')
				// debugger
				let app = this.appno || uni.getStorageSync('activeApp');
				// let app = uni.getStorageSync('activeApp');
				let srv = null
				let pageT = self.pageType
				if (self.pageType.indexOf('detail') !== -1) {
					srv = self.selectServiceName
				} else if (self.pageType === 'add' || self.pageType === 'update') {
					srv = self[`${pageT}ServiceName`]
				} else if (self.pageType === 'list') {
					srv = self[`selectServiceName`]
				} else if (this.selectServiceName) {
					srv = self.selectServiceName
				}
				const srvType = self.pageType === 'add' || self.pageType === 'update' || self.pageType.indexOf(
					'detail') !== -1 ? null : self.pageType;
				const pageType = self.listType && self.listType !== 'list' ? self.listType : self.pageType;
				let colVs = await self.getServiceV2(srv, srvType, pageType, app);
				let defaultVal = null;
				console.log('child page getFieldsV2', colVs)
				// colv = self.deepClone(colVs);
				self.colsV2Data = colVs ? self.deepClone(colVs) : {};
				if (['detaillist', 'procdetaillist', 'prochandlelist'].includes(this.pageType) && ['prochandlelist',
						'detaillist',
						'procdetaillist'
					].includes(this.listType) && self.procInstanceNo) {
					self.listConfig = colVs;
					self.colsV2Data.condition = [{
						"colName": "parent_proc_instance_no",
						"ruleType": "eq",
						"value": self.procInstanceNo
					}]
					setTimeout(() => {
						self.$refs.bxList.onRefresh()
					}, 200)
				}
				let childSrv = self.colsV2Data['child_service']
				if (self.pageType == 'update' || self.pageType == 'add' || self.pageType.indexOf('detail') !== -1) {
					let useType = self.pageType.indexOf('detail') !== -1 ? 'select' : self.pageType //procdetail
					self.getChildV2(self.selectServiceName, 'select', 'select', this.appno).then((res) => {
						console.log('load child v2 field -1:', res)
						if (res.hasOwnProperty('child_service')) {
							childSrv = res['child_service']
							// self.colsV2Data['child_service'] = []
							self.$set(self.colsV2Data, 'child_service', self.deepClone(res['child_service']))
							// childSrv =  
							// 封装子表的cols
							if (childSrv && childSrv.length > 0) {
								let childUseType = null
								if (self.feature === 'proc') {
									childUseType = self.pageType.indexOf('detail') !== -1 ? 'procdetaillist' :
										self.pageType == 'update' ? 'updatechildlist' : self.pageType ===
										'add' ? 'addchildlist' : 'select' //procdetail
								} else {
									childUseType = self.pageType.indexOf('detail') !== -1 ? 'detaillist' : self
										.pageType == 'update' ? 'updatechildlist' : self.pageType === 'add' ?
										'addchildlist' : 'select' //procdetail
								}
								for (let i = 0; i < childSrv.length; i++) {

									self.getChildV2(childSrv[i].service_name, 'select', childUseType, this
										.appno).then((
										res) => {
										console.log('load child v2 field -2' + i + ':', res)
										if (res.hasOwnProperty('srv_cols')) {
											self.$set(self.colsV2Data['child_service'][i], 'srv_cols',
												res['srv_cols'])
											self.$set(self.colsV2Data['child_service'][i], 'rowButton',
												res['rowButton'] || [])
											self.$set(self.colsV2Data['child_service'][i],
												'handerButtons', res['gridButton'] || [])
											self.$set(self.colsV2Data['child_service'][i],
												'childV2ResData', res || {})
										}
									})


								}
							}
						}
					})
				}
				let condition = [{
					colName: 'id',
					ruleType: 'eq',
					value: self.mainData.id
				}];
				switch (self.pageType) {
					case 'update':
						defaultVal = await self.getDefaultVal(condition);
						self.fields = self.setFieldsDefaultVal(colVs._fieldInfo, defaultVal ? defaultVal : self.params
							.defaultVal);
						break;
					case 'add':
						self.fields = colVs._fieldInfo.map(field => {
							if (self.defaultCondition && Array.isArray(self.defaultCondition) && colVs
								._fieldInfo && Array.isArray(colVs._fieldInfo)) {
								self.defaultCondition.forEach(cond => {
									colVs._fieldInfo.forEach(field => {
										if (cond.colName === field.column) {
											field['value'] = cond['value'];
											// field['disabled'] = true;
										}
									});
								});
							}
							if (Array.isArray(self.fieldsCond) && self.fieldsCond.length > 0) {
								self.fieldsCond.forEach(item => {
									if (item.column === field.column && field.option_list_v2 && Array
										.isArray(field.option_list_v2.conditions) && Array.isArray(item
											.condition)) {
										field.option_list_v2.conditions = field.option_list_v2
											.conditions.concat(item.condition);
									}
								});
							}
							return field;
						});
						break;
					case 'detail':
						defaultVal = await self.getDefaultVal(condition);
						self.fields = self.setFieldsDefaultVal(colVs._fieldInfo, defaultVal ? defaultVal : self
							.mainData);
						break;
					case 'procdetail':
						defaultVal = await self.getDefaultVal(condition);
						self.fields = self.setFieldsDefaultVal(colVs._fieldInfo, defaultVal ? defaultVal : self
							.mainData);
						break;
					default:
						break;
				}
			},
		}
	}
</script>

<style lang="less" scoped>

</style>
