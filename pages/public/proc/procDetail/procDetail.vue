<template>
	<view class="proc-wrap">
		<cu-custom bgColor="bg-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">流程详情</block>
		</cu-custom>
		<scroll-view scroll-x class="bg-white nav ">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="index == TabCur ? 'text-orange cur' : ''"
					v-for="(item, index) in tabList" :key="index" @tap="tabSelect" :data-id="index">
					{{ item.label }}
				</view>
			</view>
		</scroll-view>
		<view class="detail-view content-box" v-if="TabCur === 0">
			<view class="detail-form">
				<!-- <bxform ref="bxDetailForm" :pageType="type" :BxformType="type" :fields="fields"></bxform> -->
				<childPage :pageType="'detail'" :feature="'proc'" :appno='srvInfo.app'
					:selectServiceName="procBasicConfig.proc_basic.select_service"
					:pageMainServiceName="procBasicConfig.proc_basic.service_name" :mainData="procBasicConfig.mainData">
				</childPage>
			</view>
		</view>
		<view class="steps-view content-box" v-if="TabCur === 1">
			<BxSteps :procName="procNameRun" :infoList="procBasicConfig.proCharData" :scroll="scroll"
				@clickSteps="clickSteps"></BxSteps>
		</view>

		<view class="step-list  content-box" v-else-if="TabCur === 2">
			<view class="step-list-item" v-for="(item, index) in procRecord" :key="index" @click="toRecordDetail(item)">
				<view class="title">
					<text class="label">步骤名称：</text>
					<text class="value">{{ item.step_no_name }}</text>
				</view>
				<view class="status">
					<text class="label">处理结果：</text>
					<text class="value">{{ item.proc_result }}</text>
				</view>
				<view class="detail">
					<view class="detail-item">
						<view class="label" v-if="item.data_status">数据状态：{{ item.data_status }}</view>
						<view class="value"></view>
					</view>
					<view class="detail-item">
						<view class="label" v-if="item.create_user">审核人：{{ item.create_user }}</view>
						<view class="value"></view>
					</view>
					<view class="detail-item">
						<view class="label" v-if="item.create_user">创建人：{{ item.create_user }}</view>
						<view class="value"></view>
					</view>

					<view class="detail-item">
						<view class="label">审核时间：{{ item.modify_time.slice(0, 10) }}</view>
						<view class="value"></view>
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-bar">
			<view class="current-info">
				<view class="">
					<text
						class="text-gray">{{ isCurrentStepInfoRun && isCurrentStepInfoRun.state === '已处理' ? '当前状态：' : '当前步骤：' }}</text>
					<text
						class="value text-blue">{{isCurrentStepInfoRun && isCurrentStepInfoRun.state === '已处理' ? isCurrentStepInfoRun.state : isCurrentStepInfoRun.step_name }}</text>
				</view>
				<view class="">
					<text class="text-gray">责任人：</text>
					<text class="">
						{{isCurrentStepInfoRun && isCurrentStepInfoRun._approval_user ? isCurrentStepInfoRun._approval_user : isCurrentStepInfoRun._approval_user_no}}
						<!-- {{sliceString(isCurrentStepInfoRun && isCurrentStepInfoRun._approval_user ? isCurrentStepInfoRun._approval_user : isCurrentStepInfoRun._approval_user_no,16,null,true) }} -->
					</text>
				</view>
			</view>
			<view class="button-box" v-if="procBasicConfig.proHanleData && procBasicConfig.proHanleData[0].authority">
				<text class="cu-btn" :class="isBizConfig ? 'bg-red' : 'bg-blue'"
					v-if="procBasicConfig.proHanleData && procBasicConfig.proHanleData[0].activeStep !== 0"
					@click="showApprovalForm(isCurrentStepInfoRun, 'approval')">
					<!-- 审批 -->
					{{ isCurrentStepInfoRun.step_name }}
				</text>
				<text class="cu-btn bg-blue"
					v-if="procBasicConfig.proHanleData && procBasicConfig.proHanleData[0].activeStep === 0"
					@click="showApprovalForm(isCurrentStepInfoRun, 'approval')">
					<!-- 申请 -->
					{{ isCurrentStepInfoRun.step_name }}
				</text>
			</view>
		</view>
		<uni-popup ref="approvalPopup" type="bottom" :title="proHanleDataRun ? proHanleDataRun[0].step_name :''"
			:maskClick="false" :showClearButton="true">
			<view class="form-view" v-if="stepsCfgData.length > 0">

				<view v-if="!getProcFormSupport()" class="text-lg text-red padding">
					因为业务特殊性，该审批步骤不支持移动端操作，请在PC进行审批。
				</view>
				<view style="width: 100%;" v-for="(item, index) in bizConfigDataRun" :key="index"
					v-if="bizConfigDataRun.length > 0">
					<childPage
					:appno="srvInfo.app"
					 :ref="'bxFormStep' + index" :feature="'proc'"
						:listType="item._type_form == 'select' ? 'detail' :item.type==='procgrid'?'procreadlist': item.type==='grid'&&item._type_grid==='readGrid'? 'procdetaillist':item._type_grid?'prochandlelist': item._type_form"
						:pageType="item._type_form == 'select' ? 'detail' : item.type==='grid'? 'list': item._type_form"
						:selectServiceName="item.select_service" :pageMainServiceName="item.select_service"
						:updateServiceName="item.update_service" :addServiceName="item.add_service"
						:procInstanceNo="item.proc_instance_no" :mainData="item._mainData"></childPage>
				</view>
				<bxform :appno="appno" v-if="isHandler" ref="approvalForm" :pageType="'detail'" :BxformType="'detail'"
					:fields="approvalFormCfg">
				</bxform>
				<bxform
				 :appno="appno" 
					v-if="procBasicConfig.proHanleData && procBasicConfig.proHanleData.activeStep !== 0 && !isHandler && getProcFormSupport()"
					ref="approvalForm" :pageType="'add'" :BxformType="'add'" :fields="approvalFormCfgRun"></bxform>
				<view class="button-box"
					v-if="procBasicConfig.proHanleData && procBasicConfig.proHanleData.activeStep !== 0 && !isHandler && getProcFormSupport()">
					<text class="cu-btn bg-blue margin-right" @click="approvalForm">提交</text>
					<text class="cu-btn bg-green" @click="$refs.approvalPopup.close()">取消</text>
				</view>
				<text class="cu-btn bg-blue" @click="$refs.approvalPopup.close()" v-if="isHandler">确定</text>
			</view>
		</uni-popup>
		<uni-popup ref="recordPopup" type="bottom">
			<view class="form-view" v-if="currentRecord.fields && currentRecord.fields.length > 0">
				<bxform  :appno="appno"  ref="bxFormRecord" pageType="detail" BxformType="detail" :fields="currentRecord.fields">
				</bxform>
				<view class="cu-btn bg-blue radius" @click="$refs.recordPopup.close()">确定</view>
			</view>
		</uni-popup>
		<uni-popup ref="stepRecordPopup" type="bottom">
			<view class="form-view">
				<stepInfo :pageType="'detail'" :bizConfigs="stepRecordPopupInfo.bizConfigs"
					:mainData="procBasicConfig.mainData" :appno="srvInfo.app"></stepInfo>
				<view class="cu-btn bg-blue radius" @click="$refs.stepRecordPopup.close()">确定</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import bxform from '@/components/bx-form/bx-form.vue';
	import uniPopup from '@/components/uni-popup/uni-popup.vue';
	import BxSteps from '@/components/bx-steps/bx-steps.vue';
	import childPage from '@/components/bx-child-page/bx-child-page.vue';
	import stepInfo from '@/components/procStepInfo/procStepInfo.vue';
	export default {
		components: {
			bxform,
			uniPopup,
			BxSteps,
			childPage,
			stepInfo
		},
		data() {
			return {
				TabCur: 1,
				scrollLeft: 0,
				tabList: [{
						label: '基本信息'
					},
					{
						label: '流程步骤'
					},
					{
						label: '流程审批记录'
					}
				],
				stepRecordPopupInfo: {
					bizConfigs: []
				},
				isHandler: false,
				activityData: {},
				proc_instance_no: '',
				scroll: 0,
				type: 'add',
				procRecord: [],
				recordFields: [],
				currentRecord: {},
				procBasicConfig: {},
				proHanleDataRun: null,
				colsV2Data: {},
				srvInfo: {
					app: '',
					serviceName: 'srvProcess_basic_cfg_v2_select'
				},
				currentStepInfo: {}, //当前步骤的信息
				stepsCfgData: [], //当前步骤表单数据
				firstStepInfo: {}, //基础信息
				firstStepForm: [],
				formInfo: {
					serviceName: '',
					formType: ''
				},
				showProcApproval: false, //是否显示审批表单
				approvalVal: {
					proc_result: '',
					remark: '',
					turn_user_no: '',
					step_no: ''
				},
				fields: [],
				currentStepFields: [], //当前步骤的字段
				authority: false, //编辑权限
				approvalFormCfg: [{
						label: '意见',
						column: 'proc_result',
						value: '',
						type: 'radioFk',
						display: true,
						isRequire: true,
						isShowExp: [],
						options: [{
								value: 'pass',
								label: '已处理'
							},
							{
								value: 'turn',
								label: '转派'
							},
							{
								value: 'return_to_start',
								label: '退回开始'
							},
							{
								value: 'return_to_last',
								label: '退回'
							}
						]
					},
					{
						label: '转派用户',
						column: 'turn_user_no',
						value: '',
						srvInfo: {
							serviceName: 'srvsso_user_select',
							appNo: 'sso',
							isTree: false,
							column: 'user_no',
							showCol: 'real_name', //要展示的字段
							srv_app: 'sso'
						},
						option_list_v2: {
							refed_col: 'user_no',
							srv_app: 'sso',
							serviceName: 'srvsso_user_select',
							conditions: [{
								colName: 'dept_no',
								ruleType: 'eq',
								value: 'bx100sys'
							}],
							key_disp_col: 'user_disp'
						},
						type: 'treeSelector',
						display: true,
						disabled: false,
						isRequire: true,
						isShowExp: [{
							colName: 'proc_result',
							ruleType: 'eq',
							value: 'turn'
						}],
						options: []
					},
					{
						label: '说明',
						column: 'remark',
						value: '',
						type: 'textarea',
						display: true,
						isRequire: false,
						isShowExp: [{
							colName: 'proc_result',
							ruleType: 'eq',
							value: 'pass'
						}],
						options: []
					},
					{
						label: '说明',
						column: 'remark',
						value: '',
						type: 'textarea',
						display: true,
						isRequire: true,
						isShowExp: [{
							colName: 'proc_result',
							ruleType: 'neq',
							value: 'pass'
						}],
						options: []
					}
				]
			};
		},
		computed: {
			procValidateFun: function() {
				let funStr = this.currentStepInfo[0].validate_fun || null
				return funStr
			},
			mainDatas: function() {
				let self = this
				let childDataList = []
				let id = self.procBasicConfig.mainData.id;
				let stepsCfgData = self.bizConfigDataRun
				for (let j = 0; j < self.stepsCfgData.length; j++) {
					console.log('for i', j)
					let refName = 'bxFormStep' + j;
					let child = self.stepsCfgData[j];
					if (self.$refs.hasOwnProperty(refName)) {
						self.$refs[refName][0].getFieldSupportConfig
					}
					// console.log("get Field Support Config",self.$refs[refName][0].getFieldSupportConfig,self.$refs[refName][0].getFieldSupportConfig())
					if (child.hasOwnProperty("_type_form") && child._type_form && child._type_form !== 'select') {
						let serviceName = child[`${child._type_form}_service`];
						let obj = {
							serviceName: child[`${child._type_form}_service`],
							data: self.$refs[refName][0].getFieldModel() ? [self.$refs[refName][0]
								.getFieldModel()
							] : [],
							condition: [{
								colName: 'id',
								ruleType: 'in',
								value: self.procBasicConfig.mainData.id
							}]
						};
						childDataList.push(obj);
					}
				}
				return childDataList
			},
			childDatas: function() {
				let self = this
				let childs = {}
				let childDataList = {}
				for (let j = 0; j < self.stepsCfgData.length; j++) {
					console.log('for i', j)
					let refName = 'bxFormStep' + j;
					if (self.stepsCfgData[j].hasOwnProperty('_type_form') && self.$refs[refName]) {
						let child = self.$refs[refName].length > 0 ? self.$refs[refName][0].getChildDatas() : {}
						childDataList = Object.assign(childDataList, child)
					}

				}
				return childDataList
			},
			approvalFormCfgRun: function() {
				let config = this.procBasicConfig.proHanleData.filter((item) => {
					if (item.authority) {
						return item
					}
				})
				let optionTemp = this.deepClone(this.approvalFormCfg)
				if (config && config[0] && config[0].hasOwnProperty('approval_options') && config[0]
					.approval_options) {
					let approvalConfig = config[0].approval_options || [{
							value: 'pass',
							label: '已处理'
						},
						{
							value: 'turn',
							label: '转派'
						},
						{
							value: 'return_to_start',
							label: '退回开始'
						},
						{
							value: 'return_to_last',
							label: '退回'
						}
					]
					approvalConfig = approvalConfig.map((item) => {
						let obj = {
							label: item.disp,
							value: item.value
						}
						if (item.hasOwnProperty("key")) {
							obj.value = `${item.value}@${item.key}`
						}
						return this.deepClone(obj)
					})
					if (config[0].hasOwnProperty('return_options')) {
						let returnOptions = {
							label: '返回步骤',
							column: 'step_no',
							value: '',
							type: 'radioFk',
							display: true,
							isRequire: true,
							isShowExp: [{
								colName: 'proc_result',
								ruleType: 'eq',
								value: 'return'
							}],
							options: [{
									value: 'pass',
									label: '已处理'
								},
								{
									value: 'turn',
									label: '转派'
								},
								{
									value: 'return_to_start',
									label: '退回开始'
								},
								{
									value: 'return_to_last',
									label: '退回'
								}
							]
						}
						returnOptions.options = config[0].return_options.map((item) => {
							let obj = {
								value: item.value,
								label: item.disp
							}
							return obj
						})
						// optionTemp.push(returnOptions)
						optionTemp.splice(1, 0, returnOptions)
					}
					optionTemp[0].options = approvalConfig

				}

				return optionTemp
			},
			// myApprovalStepBizRun:function(){
			// 	// let self = this
			// 	let config = this.myApprovalStepBiz()
			// 	return config
			// },
			bizConfigDataRun: function() {

				let self = this
				let bizData = []
				if (this.proHanleDataRun && this.proHanleDataRun.length > 0) {
					bizData = this.proHanleDataRun[0].biz_cfg_data
					bizData = this.deepClone(bizData)
				}

				return bizData
			},
			isBizConfig: function() {
				let biz = this.bizConfigDataRun
				let isNotCheck = []
				isNotCheck = biz.map((item) => {
					if (item._type_form !== 'select') {
						return item
					}
				})
				if (isNotCheck.length > 0) {
					return false
				} else {
					return false
				}
			},
			isCurrentStepInfoRun: function() {
				let info = this.currentStepInfo && this.currentStepInfo[0] ? this.currentStepInfo[0] : {
					processStatus: "null",
					state: "null",
					step_name: "",
					step_no: "",
				}
				return info
			},

			procNameRun: function() {
				let name = this.procBasicConfig && this.procBasicConfig.proc_basic && this.procBasicConfig.proc_basic
					.proc_name ? this.procBasicConfig.proc_basic.proc_name : ""
				uni.setNavigationBarTitle({
					title: name
				})
				return name
			}
		},
		methods: {

			getProcFormSupport() {
				let type = this.currentStepInfo[0].mobile_approval_limit || 'UI自定义'
				let forms = this.bizConfigDataRun
				let config = this.fieldSupportConfig
				let isSupport = false
				let isSupportList = []
				if (type === 'UI自定义') {
					for (let i = 0; i < forms.length; i++) {
						let formType = forms._formType || null
						if (forms[i].hasOwnProperty("_type_form") && forms[i]._type_form !== 'select' && forms[i].fields) {
							let fields = forms[i].fields.map((item) => {
								return item.type
							})
							let support = []
							for (let type in fields) {
								if (config.indexOf(fields[type]) === -1 && formType !== 'detail' && !forms[i].fields
									.disabled) {
									support.push(forms[i].fields)
								}
							}
							if (support.length > 0) {
								isSupport = true
								isSupportList.push(forms[i])
							}
						} else if (forms[i].hasOwnProperty("_type_form") && forms[i]._type_form == 'select') {
							isSupport = true
						}
					}
				} else if (type === '否') {
					isSupport = true
				}
				if (isSupportList.length > 0) {
					isSupport = false
				}
				return isSupport
			},
			myApprovalStepBiz() {
				let self = this
				let proHanleData = self.procBasicConfig.proHanleData
				proHanleData = proHanleData.filter((item) => item.authority)
				let proHanleDataRun = []
				for (let han in proHanleData) {
					let bizconfig = proHanleData[han].biz_cfg_data.filter((item) => item.hasOwnProperty("biz_type"))
					let biz = this.deepClone(bizconfig)
					biz.forEach(async (item) => {
						let bizRes = self.getV2UseType(item)
						let infoData = await self.getDetail(item.select_service, null, item)
						item._mainData = infoData
						item.fields = await self.getColV2(bizRes.srvName, bizRes.srvType, bizRes.pageType,
							infoData)
						console.log("myApprovalStepBiz", item)
					})
					if (biz) {
						proHanleData[han].biz_cfg_data = biz
					}
					proHanleDataRun.push(proHanleData[han])

				}


				self.proHanleDataRun = proHanleDataRun
			},
			tabSelect(e) {
				this.TabCur = Number(e.currentTarget.dataset.id);
				this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;
			},
			toRecordDetail(data) {
				//查看流程审批记录详情
				console.log(data);
				this.currentRecord = data;
				this.$refs.recordPopup.open();
			},
			hideApprovalForm() {
				this.$refs.approvalPopup.close();
			},
			async showApprovalForm(data, type) {
				console.log("showApprovalForm on", data, type)
				let self = this

				this.stepsCfgData = [];
				if (this.isBizConfig) {
					uni.showToast({
						title: '该业务不支持手机端审批',
						icon: 'none'
					});
				} else {
					if (data.state === '已处理') {
						this.isHandler = true;
					} else {
						this.isHandler = false;
					}
					let datas = await this.getApprovalForm(data)
					console.log("getApprovalForm datas", datas)
					if (datas) {
						this.myApprovalStepBiz()
						this.stepsCfgData = [];
						let fieldList = this.deepClone(datas);
						if (type && type == 'approval') {
							for (let i = 0; i < this.approvalFormCfg.length; i++) {
								this.approvalFormCfg[i].value = '';
							}
							if (fieldList.length > 0 && fieldList[0].fields) {
								fieldList.forEach(item => {
									item.fields.forEach(item2 => {
										item2.value = '';
									});
								});
							}
							for (let i = 0; i < fieldList.length; i++) {
								this.stepsCfgData.push(fieldList[i])
							}
							console.log("getApprovalForm2", self.stepsCfgData, self.bizConfigDataRun, self
								.stepsCfgData[0].fields)
							setTimeout(function() {
								self.$refs.approvalPopup.open();
							}, 500)

						}
					}
					// this.getApprovalForm(data).then(e => {
					// 	if (e) {
					// 		this.stepsCfgData = [];
					// 		let fieldList = this.deepClone(e);
					// 		if (type && type == 'approval') {
					// 			for(let i = 0;i<this.approvalFormCfg.length;i++){
					// 				this.approvalFormCfg[i].value = '';
					// 			}
					// 			if (fieldList.length > 0 && fieldList[0].fields) {
					// 				fieldList.forEach(item => {
					// 					item.fields.forEach(item2 => {
					// 						item2.value = '';
					// 					});
					// 				});
					// 			}

					// 			self.stepsCfgData = fieldList.filter((q) =>q); 
					// 			console.log("getApprovalForm2",self.stepsCfgData,self.bizConfigDataRun,self.stepsCfgData[0].fields)
					// 			setTimeout(function(){
					// 				self.$refs.approvalPopup.open();
					// 			},500)

					// 		}
					// 	}
					// });
				}

			},
			async clickSteps(e) {
				let stepData = e.data
				let self = this
				if (stepData.state == '已处理' && stepData.biz_cfg_data.length > 0) {
					let bizData = stepData.biz_cfg_data
					console.log("bizData", bizData)
					bizData = bizData.filter((item) => item.hasOwnProperty("_type_form"))
					bizData = this.deepClone(bizData)
					console.log('clickSteps', e)
					for (let key in bizData) {
						let bizRes = self.getV2UseType(bizData[key])
						let infoData = await self.getDetail(bizData[key].select_service, null, bizData[key])
						bizData[key]._mainData = infoData
						bizData[key].fields = await self.getColV2(bizRes.srvName, bizRes.srvType, bizRes.pageType,
							infoData)
						// self.getApprovalForm(bizData[key]).then((res)=>{
						// 	if (res) {
						// 		console.log("clickSteps==",res)
						// 		let fieldList = self.deepClone(res);
						// 		if (fieldList.length > 0 && fieldList[0].fields) {
						// 			fieldList.forEach(item => {
						// 				item.fields.forEach(item2 => {
						// 					item2.value = '';
						// 				});
						// 			});
						// 		}

						// 	}
						// })
					}
					self.stepRecordPopupInfo = {
						bizConfigs: bizData
					}
					self.$refs.stepRecordPopup.open();
				}



				// if (e.data.step_no === this.currentStepInfo.step_no && !this.procBasicConfig.proHanleData.authority) {
				// 	uni.showToast({
				// 		title: '无权处理',
				// 		icon: 'none'
				// 	});
				// 	return;
				// } else {
				// 	let approvalFormCfg = this.approvalFormCfg;
				// 	let stepData = e.data;
				// 	let recordData = this.procRecord;
				// 	recordData.forEach(record => {
				// 		if (stepData.step_no === record.step_no) {
				// 			stepData.remark = record.remark;
				// 			stepData.proc_result = record.proc_result;
				// 			console.log('step,record', stepData);
				// 			Object.keys(stepData).forEach(key => {
				// 				this.approvalFormCfg.forEach((field, index) => {
				// 					if (field.column === key) {
				// 						field['value'] = stepData[key];
				// 						this.$set(this.approvalFormCfg, index, field);
				// 					}
				// 				});
				// 			});
				// 		}
				// 	});
				// 	if (e.index !== 0 && e.index <= this.scroll) {
				// 		if (e.data.state !== '已处理') {
				// 			this.showApprovalForm(e.data, 'approval');
				// 		} else {
				// 			this.showApprovalForm(e.data);
				// 		}
				// 	} else if (e.index === 0) {
				// 		this.TabCur = 0;
				// 	}


				// 	console.log('clickSteps', e);
				// }
			},
			async getBasicCfg(proc_instance_no) {
				// srvprocess_basic_cfg_select 流程初始化数据查询
				let serviceName = this.srvInfo.serviceName;
				let req = {
					serviceName: 'srvProcess_basic_cfg_v2_select',
					colNames: ['*'],
					condition: [{
						colName: 'proc_instance_no',
						ruleType: 'eq',
						value: proc_instance_no
					}]
				};
				let appName = this.srvInfo.app || uni.getStorageSync('activeApp')
				let res = await this.onRequest('select', 'srvProcess_basic_cfg_v2_select', req, appName);
				if (res.data.state === 'SUCCESS') {
					let procBasicConfig = res.data;
					let keys = Object.keys(res.data)
					for (let key in procBasicConfig) {
						this.$set(this.procBasicConfig, key, procBasicConfig[key])
					}
					for (let i = 0; i < procBasicConfig.proHanleData.length; i++) {
						this.$set(this.procBasicConfig.proHanleData, i, procBasicConfig.proHanleData[i])
					}
					// this.myApprovalStepBiz()
					this.activityData = res.data.mainData;
					// this.getCurStepConfig(res.data['proCharData'][res.data['proHanleData']['activeStep']]);
					this.getApprovalForm(res.data['proCharData'][res.data['proHanleData']['activeStep']]); //获取当前步骤的信息
					this.getCurStepConfig(res.data['proCharData'][0], 'firstStep'); //获取第一步信息
					this.currentStepInfo = res.data['proCharData'][res.data['proHanleData']['activeStep']];
					this.currentStepInfo = [res.data['proHanleData'][0]];
					this.firstStepInfo = res.data['proCharData'][0];
					this.scroll = res.data.proHanleData.activeStep;
				}
			},
			async getApprovalForm(e) {
				console.log('getApprovalForm', e);
				let cfg = e && e.biz_cfg_data ? e.biz_cfg_data : []; //表单配置
				let cfgData = [{
					type: '',
					serviceName: '',
					fields: [],
					formData: {}
				}];
				if (cfg && cfg.length > 0) {
					for (let i = 0; i < cfg.length; i++) {
						const item = cfg[i];
						cfg[i]['fields'] = []
						if (item.type === 'form') {
							if (item._type_form && e.state !== '已处理' && item.authority) {
								let serviceName = item[`${item._type_form}_service`];
								let type = item._type_form;
								let fields = await this.getColV2(serviceName, item._type_form, item._type_form);

								fields.forEach((item, index) => {
									console.log(index)
									cfg[i]['fields'].push(item)
								})
								cfg[i]['formType'] = type;
							} else if (item.select_service && e.state === '已处理' && item._type_form) {
								let serviceName = item.select_service;
								let fields = await this.getColV2(serviceName, 'detail', 'detail');
								cfg[i]['formType'] = 'detail';
								let data = await this.getDetail(serviceName, fields);
								console.log('getDetail(serviceName)', data);
								cfg[i]['fields'] = []
								let keys = Object.keys(data)
								let f = cfg[i]['fields']
								for (let i = 0; i < keys.length; i++) {
									for (let j = 0; j < fields.length; j++) {
										if (fields[j].column === keys[i]) {

											fields[j]['value'] = data[keys[i]];
											fields[j]['disabled'] = true;
											console.log(j)
											cfg[i]['fields'].push(fields[j])
											this.$set(cfg[i]['fields'], j, fields[j]);

										}
									}
									// fields.forEach((field, index) => {

									// });
								}
								// keys.forEach(key => {

								// });
							}
						}
					}
					return cfg;
				} else {
					return this.approvalFormCfg;
				}
			},
			async getProcRecord() {
				//查找流程审批记录
				let req = {
					serviceName: 'srvprocess_record_select',
					colNames: ['*'],
					condition: [{
						colName: 'proc_instance_no',
						value: this.proc_instance_no,
						ruleType: 'eq'
					}],
					order: [{
						colName: 'id',
						orderType: 'desc'
					}]
				};
				let appName = this.srvInfo.app || uni.getStorageSync('activeApp')
				let res = await this.onRequest('select', 'srvprocess_record_select', req, appName);
				if (res.data.state === 'SUCCESS') {
					this.procRecord = res.data.data;
					this.getColV2(req.serviceName, 'detail', "list").then(cols => {
						// console.log('recordFields', cols);
						this.recordFields = cols;
						this.procRecord.forEach((item, i) => {
							let recordFields = this.deepClone(cols);
							// console.log('recordFields121', item);
							Object.keys(item).forEach(key => {
								recordFields.forEach((field, index) => {
									if (field.column === key) {
										field['value'] = item[key];
									}
								});
							});
							item['fields'] = recordFields;
							this.$set(this.procRecord, i, item);
						});
					});
				}
			},
			async getDetail(serviceName, fields, info) {
				uni.showLoading();
				let col = fields ? fields.map(item => item.column) : ['*'];
				let req = {
					serviceName: serviceName,
					condition: [{
						colName: (info && info.biz_type == 'main' || !info) ? 'proc_instance_no' :
							'parent_proc_instance_no',
						ruleType: 'eq',
						value: this.proc_instance_no
					}],
					colNames: col,
					hisVer: true
				};
				let appName = this.srvInfo.app || uni.getStorageSync('activeApp')
				let res = await this.onRequest('select', req.serviceName, req, appName);
				uni.hideLoading();
				if (res.data.state === 'SUCCESS') {
					// console.log('getDetail111', res.data.data);
					if (res.data.data.length > 0) {
						return res.data.data[0];
					}
				}
			},
			getV2UseType(biz) {
				let bizData = biz || null
				let srvType = null
				let pageType = null
				let srvName = null
				if (biz.type === 'form') {
					srvType = bizData._type_form
					if (bizData._type_form === 'add') {
						srvName = bizData.add_service
						pageType = 'add'
					} else if (bizData._type_form === 'update') {
						srvName = bizData.update_service
						pageType = 'update'
					} else if (bizData._type_form === 'select') {
						pageType = 'detail'
						srvName = bizData.select_service
					}
				} else if (biz.type === 'list') {
					if (bizData.formType === 'add') {
						srvName = bizData.add_service
					} else if (bizData.formType === 'update') {
						srvName = bizData.update_service
					} else if (bizData.formType === 'select') {
						srvName = bizData.select_service
					}
				}
				return {
					srvName,
					srvType,
					pageType
				}
			},
			getCurStepConfig(e, type) {
				let self = this
				if (e && e.state !== '未开始') {
					console.log('getCurStepConfig', e);
					if (e.biz_cfg_data && e.biz_cfg_data.length > 0) {
						const biz_cfg = e.biz_cfg_data;
						biz_cfg.map(item => {
							if (item._type_form && item.authority) {
								self.formInfo.formType = item._type_form;
								self.type = item._type_form;
								self.formInfo.serviceName = item[`${item._type_form}_service`];
								let bizRes = self.getV2UseType(item)
								self.getColV2(bizRes.srvName, bizRes.srvType, bizRes.pageType).then(fields => {
									if (type === 'firstStep') {
										self.fields = fields;
										Object.keys(self.procBasicConfig.mainData).forEach(key => {
											self.fields.forEach((field, index) => {
												if (field.column === key) {
													field['value'] = self.procBasicConfig
														.mainData[key];
													self.$set(self.fields, index, field);
												}
											});
										});
									} else {
										self.currentStepFields = fields;
									}
								});
							} else if (item.select_service && item.authority) {
								self.formInfo.formType = 'detail';
								self.type = 'detail';
								self.formInfo.serviceName = item.select_service;
								let bizRes = self.getV2UseType(item)
								self.getColV2(bizRes.srvName, bizRes.srvType, bizRes.pageType).then(fields => {
									console.log("fields", fields)
									if (type === 'firstStep') {
										this.fields = fields;
										Object.keys(this.procBasicConfig.mainData).forEach(key => {
											this.fields.forEach((field, index) => {
												if (field.column === key) {
													field['value'] = this.procBasicConfig
														.mainData[key];
													this.$set(this.fields, index, field);
												}
											});
										});
									} else {
										this.currentStepFields = fields;
									}
								});
							}
						});
					}
				}
			},
			async approvalForm() {
				// 提交审批
				let self = this;
				debugger
				if (self.procBasicConfig.proHanleData.activeStep === 0) {
					//重新申请
					for (let i = 0; i < self.stepsCfgData.length; i++) {
						let ref = 'bxFormStep' + i;
						let item = self.stepsCfgData[i];
						if (item.formType) {
							let serviceName = item[`${item.formType}_service`];
							let itemData = self.$refs[ref][0].getFieldModel();
							if (itemData === false) {
								return
							} else {
								itemData = itemData ? itemData : {}
							}
							if (!itemData.file_no) {
								itemData.file_no = '';
							}
							if (!itemData.remark) {
								itemData.remark = '';
							}
							if (itemData === false) {
								return;
							}

							let req = [{
								serviceName: 'srvoa_issue_info_update',
								condition: [{
									colName: 'proc_instance_no',
									ruleType: 'eq',
									value: self.proc_instance_no
								}],
								proc_instance_no: self.proc_instance_no,
								data: [itemData]
							}];
							if (res.data.state === 'SUCCESS') {
								console.log(res.data, 'res.data');
								uni.showToast({
									title: res.data.resultMessage,
									icon: 'none'
								});
								uni.showModal({
									title: '提示',
									content: res.data.resultMessage,
									showCancel: false,
									success(res) {
										if (res.confirm) {
											self.hideApprovalForm();
											self.getBasicCfg(self.proc_instance_no);
											self.getProcRecord(self.proc_instance_no);
										}
									}
								});
							} else {
								uni.showToast({
									title: res.data.resultMessage,
									icon: 'none'
								});
							}

							// });
						}
					}
				} else {
					let approval = self.$refs.approvalForm.getFieldModel();
					if (approval === false) {
						return
					} else {
						approval = approval ? approval : {}
					}
					console.log('approval', approval);
					let child_data_list = [];
					let id = self.procBasicConfig.mainData.id;
					let stepsCfgData = self.bizConfigDataRun
					if (approval.proc_result === 'pass') {
						for (let j = 0; j < self.stepsCfgData.length; j++) {
							console.log('for i', j)
							let refName = 'bxFormStep' + j;
							let child = self.stepsCfgData[j];
							if (self.$refs.hasOwnProperty(refName)) {
								self.$refs[refName][0].getFieldSupportConfig
							}

							// console.log("get Field Support Config",self.$refs[refName][0].getFieldSupportConfig,self.$refs[refName][0].getFieldSupportConfig())
							if (child.hasOwnProperty("_type_form") && child._type_form && child._type_form !==
								'select') {
								let serviceName = child[`${child._type_form}_service`];
								let data = self.$refs[refName][0].getFieldModel()
								if (data === false) {
									return
								} else {
									data = data ? data : {}
								}
								let obj = {
									serviceName: child[`${child._type_form}_service`],
									data: data ? [data] : [],
									condition: [{
										colName: 'id',
										ruleType: 'in',
										value: self.procBasicConfig.mainData.id
									}]
								};
								child_data_list.push(obj);
							}
						}
					}
					console.log(child_data_list, 'child_data_list');
					let procResult = approval.proc_result
					if (procResult.indexOf('@') !== -1) {
						procResult = procResult.split("@")
					} else {
						procResult = [procResult]
					}
					let reqData = [{
						data: [{
							child_data_list: child_data_list,
							key: procResult[1] || procResult[0],
							proc_result: procResult[0],
							remark: approval.remark,
							turn_user_no: approval.turn_user_no
						}],
						proc_instance_no: self.proc_instance_no,
						"proc_data_type": "submit",
						step_no: self.currentStepInfo[0].step_no
					}];
					if (approval.hasOwnProperty("step_no")) {
						reqData[0]['data'][0]['step_no'] = approval.step_no
					}
					let appName = self.srvInfo.app || uni.getStorageSync('activeApp')
					let url = self.getServiceUrl(appName, 'approval', 'process');
					console.log("reqData", reqData)
					let isValidateFun = {
						valid: true,
						msg: ''
					}
					if (self.procValidateFun) {
						// datas,childDatas
						let datas = self.mainDatas
						let childDatas = self.childDatas
						let testFun = new Function(`return (${self.procValidateFun})`)
						testFun = testFun()
						isValidateFun = testFun(datas, childDatas)
						console.log("procValidateFun", isValidateFun)
					}
					if (isValidateFun.valid) {
						let appName = self.srvInfo.app || uni.getStorageSync('activeApp')
						let res = await self.onRequest('process', 'approval', reqData, appName);
						if (res.data.state === 'SUCCESS') {
							console.log(res.data);
							uni.showToast({
								title: res.data.resultMessage,
								icon: 'none'
							});
							self.hideApprovalForm();
							self.getBasicCfg(this.proc_instance_no);
							self.getProcRecord(this.proc_instance_no);
						} else {
							uni.showToast({
								title: res.data.resultMessage,
								icon: 'none'
							});
						}
						console.log(`reqData`, reqData);
					} else {
						uni.showToast({
							title: isValidateFun.msg,
							icon: 'none'
						});
					}

				}
			},
			async getColV2(serviceName, type, pageType, activityData) {
				console.log("getColV2", serviceName, type, pageType, activityData)
				let appName = this.srvInfo.app || uni.getStorageSync('activeApp')
				let colVs = await this.getServiceV2(serviceName, type, pageType, appName);
				this.colsV2Data = colVs;
				// let type = this.type;
				// console.log('colsV2Data', colVs);
				let fields = [];
				switch (type) {
					// case 'update':
					//   fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
					//   break;
					case 'update':
						fields = !activityData ? colVs._fieldInfo : this.setFieldsDefaultVal(colVs._fieldInfo,
							activityData ? activityData : this.activityData);
						break;
					case 'add':
						fields = colVs._fieldInfo;
						break;
					case 'detail':
						fields = this.setFieldsDefaultVal(colVs._fieldInfo, this.activityData);
						break;
					case 'select':
						fields = this.setFieldsDefaultVal(colVs._fieldInfo, activityData);
						break;
					default:
						break;
				}
				if (this.scroll === 0 && type == 'update') {
					fields = this.setFieldsDefaultVal(colVs._fieldInfo, activityData ? activityData : this
						.activityData);
				}
				if (fields && Array.isArray(fields)) {
					fields = fields.map((item, index) => {
						if (!item.value) {
							item.value = '';
						}
						// if (item.type === 'Note') {
						//   item.type = 'textarea';
						// }
						// if (item['in_' + type] === 1) {
						return item;
						// }
					});

					// this.fields = fields;
				}

				// console.log('colsV2Datafields', fields);
				return fields;
			}
		},
		onLoad(option) {
			if (option.proc_instance_no) {
				this.proc_instance_no = option.proc_instance_no;
				this.srvInfo.app = option.appno || uni.getStorageSync('activeApp');
				this.getBasicCfg(option.proc_instance_no);
				this.getProcRecord(option.proc_instance_no);
			}
		}
	};
</script>

<style scoped lang="scss">
	.proc-wrap {
		padding-bottom: 150upx;
		position: relative;

		.nav {
			height: 90upx;
		}

		.scroll-fixed {
			top: 90upx;
			z-index: 1024;
			position: fixed;
		}

		.uni-popup {
			z-index: 999;
		}

		/deep/ .uni-scroll-view {
			height: auto;
		}
	}

	.steps-view {
		// margin-top: 100upx;
		// padding-bottom: 150upx;
	}

	.flow-view {
		width: 100%;
		// min-height: 80vh;
		margin-top: 10upx;
		background-color: #fff;
		overflow: hidden;

		.scroll-view {
			padding: 30upx 10upx;
		}

		.cu-timeline {
			.cu-item {
				padding: 5px 15px 5px 54px;
				position: relative;
				display: block;
				z-index: 0;
			}

			.head {
				display: flex;
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

	.step-list {
		width: 100%;
		display: flex;
		flex-direction: column;

		.step-list-item {
			background-color: #fff;
			width: calc(100% - 20upx);
			display: flex;
			flex-direction: column;
			margin: 10upx;
			padding: 20upx;
			border-radius: 10upx;

			.title {
				font-size: 32upx;
				line-height: 50upx;
				font-weight: bold;
			}

			.detail {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;

				.detail-item {
					min-width: 40%;
				}
			}
		}
	}

	.detail-view {
		margin-top: 10upx;
		padding-bottom: 150upx;
		min-height: 100vh;
		background-color: #fff;
		display: flex;
		flex-direction: column;
	}

	.cu-dialog {
		height: auto;
	}

	.form-view {
		background-color: #fff;
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - var(--window-bottom) - var(--window-top));
		padding: 30upx 0 100upx;
		overflow: scroll;

		.button-box {
			height: 100upx;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 20upx 0 40upx;
		}

		.cu-btn {
			max-width: 60%;
			min-width: 200rpx;
			min-height: 60upx;
			margin: 50upx auto 20rpx;

			&+.cu-btn {
				margin-left: 20px;
			}
		}
	}

	.bottom-bar {
		background-color: #fff;
		z-index: 20;
		width: 100%;
		min-height: 100upx;
		display: flex;
		// flex-direction: column;
		// justify-content: center;
		align-items: center;
		border-top: 1px solid rgba($color: #999, $alpha: 0.5);
		position: fixed;
		bottom: 0;
		padding: 10rpx 20rpx;
		flex-wrap: wrap;

		.text-blue {
			font-weight: bold;
			font-size: 32upx;
		}

		.button-box {
			text-align: center;
			margin-left: auto;
			padding: 20rpx 0;
		}
	}

	.content-box {
		margin-bottom: 100upx;
	}
</style>
