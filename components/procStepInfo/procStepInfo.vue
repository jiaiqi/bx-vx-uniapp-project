<template>
	<view>
		<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
			<view class="cu-item" :class="index==TabCur?'text-green cur':''" v-for="(item,index) in tabConfigRun" :key="index" @tap="tabSelect(item,index)" :data-id="index">
				{{item._section_name}}
			</view>
		</scroll-view>
		<view v-if="index == TabCur" v-for="(form,index) in tabConfigRun" :key="index">
			<bxform :ref="'bxDetailForm' + index" :pageType="pageType" :BxformType="'detail'" :fields="form.fields"></bxform>
		</view>
		
		
	</view>
</template>

<script>
	import bxform from '@/components/bx-form/bx-form.vue';
	import bxList from '@/components/bx-list/bx-list.vue';
	export default {
		components: { bxform,bxList},
		props:{
			pageType:{
				type:String,
				default:''
			},
			bizConfigs:{
				type:Array,
				default(){
					return []
				}
			},
			mainData:{
				type:Object,
				default(){
					return {}
				}
			},
			appno:{
				type:String
			}
		},
		data() {
			return {
				index:0,
				TabCur:0,
				scrollLeft:0,
				colsV2Data:null,
				fields:[],
				defaultCondition: [],
				params: {},
				addType: '',
				fieldsCond: [] ,//treeSelector类型字段的条件
				serviceName: '',
				placeholder: '输入搜索关键词',
				listConfig: {},
				srv_cols: [],
				condition: [],
				relation_condition: null,
				pattern: { color: '#7A7E83', backgroundColor: '#fff', selectedColor: '#007AFF', buttonColor: '#007AFF' },
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
				heightStyle:"80vh",
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
			// this.getFieldsV2()
		},
		computed:{
			"tabConfigRun":function(){
				let self = this
				let tabs = self.bizConfigs
				tabs = tabs.filter((item) => item.hasOwnProperty("_type_form"))
				// let config = {
				// 	serviceName:"",
				// 	defaultCondition:[],
				// 	title:"",
				// 	type:"",
				// 	pageType:""
				// }
				// let configs = []
				// let main = self.deepClone(config)
				// main['serviceName'] = self.selectServiceName
				// if(self.colsV2Data){
				// 	main['title'] = self.colsV2Data.service_view_name
				// 	main['type'] = "main"
				// 	main['pageType'] = self.selectServiceName
				// 	main['_v2Data'] = self.deepClone(self.colsV2Data)
				// 	configs.push(main)
				// 	if(self.colsV2Data.child_service && self.colsV2Data.child_service.length > 0){
				// 		let childSrv = self.colsV2Data.child_service
				// 		childSrv.forEach((item) =>{
				// 			let obj = self.deepClone(config)
				// 			obj['serviceName'] = item.service_name
				// 			obj['title'] = item.service_view_name
				// 			obj['type'] = "child"
				// 			obj['pageType'] = item.foreign_key.view_model
				// 			obj['condition'] = self.getForKeyCond(this.mainData,item.foreign_key)
				// 			obj['_v2Data'] = self.deepClone(item)
				// 			configs.push(obj)
				// 		})
				// 	}
				// }
				
				return tabs
				
			},
			"tabConfig":function(){
				let self = this
				let config = {
					serviceName:"",
					defaultCondition:[],
					title:"",
					type:"",
					pageType:""
				}
				let configs = []
				let main = self.deepClone(config)
				main['serviceName'] = self.selectServiceName
				if(self.colsV2Data){
					main['title'] = self.colsV2Data.service_view_name
					main['type'] = "main"
					main['pageType'] = self.selectServiceName
					main['_v2Data'] = self.deepClone(self.colsV2Data)
					configs.push(main)
					if(self.colsV2Data.child_service && self.colsV2Data.child_service.length > 0){
						let childSrv = self.colsV2Data.child_service
						childSrv.forEach((item) =>{
							let obj = self.deepClone(config)
							obj['serviceName'] = item.service_name
							obj['title'] = item.service_view_name
							obj['type'] = "child"
							obj['pageType'] = item.foreign_key.view_model
							obj['condition'] = self.getForKeyCond(this.mainData,item.foreign_key)
							obj['_v2Data'] = self.deepClone(item)
							configs.push(obj)
						})
					}
				}
				
				return configs
				
			},
		},
		methods:{
			tabSelect(e,index) {
				console.log(e)
				this.TabCur = index;
				this.scrollLeft = (index - 1) * 60
			},
			listChange(e) {
				console.log('listChange:', e);
			},
			loadEnd(e) {
				this.noData = true;
			},
			async getListV2() {
				let app = this.appno||uni.getStorageSync('activeApp');
				let self = this;
				let colVs = await this.getServiceV2(this.serviceName, 'list', this.pageType === 'proc' ? 'proclist' : 'list', app);
				colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1 || item.in_list === 2);
				if (!this.navigationBarTitle) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
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
										self.showAdd = self.queryOption.showAdd === 'false' ? false : self.queryOption.showAdd == 'true' ? true : self.queryOption.showAdd;
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
			async getDefaultVal() {
				if (this.pageType === 'detail' || this.pageType === 'update') {
					let app = this.appno||uni.getStorageSync('activeApp');
					let url = this.getServiceUrl(app, this.selectServiceName, 'select');
					let req = {
						serviceName: this.selectServiceName,
						colNames: ['*'],
						condition: this.params.condition ? this.params.condition : [],
						page: { pageNo: 1, rownumber: 10 }
					};
					let res = await this.$http.post(url, req);
					if (res.data.state === 'SUCCESS') {
						if (Array.isArray(res.data.data) && res.data.data.length > 0) {
							return res.data.data[0];
						}
					}
				}
			},
			getFieldsV2: async function() {
				let self = this
				console.log('child page getFieldsV2')
				let app = this.appno||uni.getStorageSync('activeApp');
				let colVs = await self.getServiceV2(self.selectServiceName, self.pageType, self.pageType, app);
				let defaultVal = null;
				console.log('child page getFieldsV2',colVs)
				// colv = self.deepClone(colVs);
				self.colsV2Data = self.deepClone(colVs);
				if (colVs.service_view_name) {
					uni.setNavigationBarTitle({
						title: colVs.service_view_name
					});
				}
				switch (self.pageType) {
					case 'update':
						defaultVal = await self.getDefaultVal();
						self.fields = self.setFieldsDefaultVal(colVs._fieldInfo, defaultVal ? defaultVal : self.params.defaultVal);
						break;
					case 'add':
						self.fields = colVs._fieldInfo.map(field => {
							if (self.defaultCondition && Array.isArray(self.defaultCondition) && colVs._fieldInfo && Array.isArray(colVs._fieldInfo)) {
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
									if (item.column === field.column && field.option_list_v2 && Array.isArray(field.option_list_v2.conditions) && Array.isArray(item.condition)) {
										field.option_list_v2.conditions = field.option_list_v2.conditions.concat(item.condition);
									}
								});
							}
							return field;
						});
						break;
					case 'detail':
						defaultVal = await self.getDefaultVal();
						self.fields = self.setFieldsDefaultVal(colVs._fieldInfo, self.mainData);
						break;
					default:
						break;
				}
			},
		}
	}
</script>

<style lang="less">

</style>
