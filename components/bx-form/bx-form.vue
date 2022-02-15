<template>
	<view class="bg-white" style="width:100%;padding:20upx 6upx" v-if="allFieldRun.length > 0">
		<view v-if="title" class="form-title">{{title}}</view>
		<view v-for="(item, index) in allFieldRun" :key="index">
			<formItem v-if="evalXIf(item)" v-show="referencedColName !== item.column" :procData="procData" :field="item"
				:referencedColName="referencedColName" :pageFormType="updateType" :showTextarea="showTextarea"
				:appno="appno"
				:fieldsModel="fieldModel" :service="service" :detailFiledData="detailFiledData" ref="fitem"
				@on-form-item="onItemButtons($event)" @on-value-change="onValChange($event)"
				@on-value-blur="onValBlur($event)" @get-cascader-val="getCascaderVal" @picker-change="pickerchange"
				@show-option-list="showOptionlist"></formItem>
		</view>
	</view>
</template>

<script>
	import dayjs from '@/common/dayjs.min.js'
	import formItem from '@/components/bx-form/bx-form-item.vue';
	import evaluatorTo from '@/common/evaluator.js';
	export default {
		name: 'bx-form',
		components: {
			formItem
		},
		props: {
			referencedColName: {
				type: String,
				default () {
					return '';
				}
			},
			fields: {
				type: Array,
				default () {
					return [];
				}
			},
			procData: {
				type: Object,
				default () {
					return {};
				}
			},
			defaultCondition: {
				type: Array,
				default () {
					return [];
				}
			},
			pageType: {
				type: String,
				default () {
					return '';
				}
			},
			BxformType: {
				type: String,
				default () {
					return 'form';
				}
			},
			service: {
				type: String,
				default () {
					return '';
				}
			},
			title: {
				type: String,
				default () {
					return '';
				}
			},
			showTextarea: {
				type: Boolean,
				default: true
			},
			moreConfig: {
				type: Object,
				default () {
					return {};
				}
			},
			childDatas: {
				type: Object
			},
			detailFiledData: {
				type: Object,
				default () {
					return {};
				}
			},
			appno:{
				type:String
			}
		},
		data() {
			return {
				allField: this.fields,
				fieldModel: {},
				fieldData: {},
				oldField: [],
				oldFieldModel: {},
				specialCol: [],
				more_config: {
					col_relation: [{
						watch_col: ['page_end', 'page_start'], //相关字段
						dest_col: 'page', //页数
						value: {
							type: 'calc', //col  || calc 计算或者某字段对应值
							value: {
								type: 'sub', //减
								value: [{
										type: 'col',
										val: 'page_end'
									},
									{
										type: 'col',
										val: 'page_start'
									},
									{
										type: 'value',
										val: '-1'
									}
								]
							}
						}
					}],
					service_call_cfg: [{
						app: 'salesroom',
						service: 'srvsalesroom_print_price_calc_select',
						watch_col: ['page', 'paper_type', 'duplex_print', 'color'],
						req: {
							condition: [{
									colName: 'page_num',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'page'
									}
								},
								{
									colName: 'paper_type',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'paper_type'
									}
								},
								{
									colName: 'duplex_print',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'duplex_print'
									}
								},
								{
									colName: 'color',
									ruleType: 'eq',
									value: {
										valueType: 'rowData',
										valueKey: 'color'
									}
								}
							]
						}
					}]
				}
			};
		},
		created() {
			if (this.fieldModel.length > 0) {
				this.fieldModel = this.fieldModel.map(item => {
					if (!item.value && item.defaultValue) {
						if(item.defaultValue==='[]'){
							item.defaultValue = ''
						}
						item.value = item.defaultValue;
					}
					if (!item.value && item.initValue) {
						item.value = item.initValue;
					}
					return item;
				});
				this.oldField = this.deepClone(this.fields);
				this.oldField.forEach((item, index) => {
					this.oldFieldModel[item.column] = item.value;
				});
			}
			this.getAllField();
		},
		computed: {
			"allFieldRun": function() {
				return this.allField
			},
			"submintType": function() {
				let BxformType = this.BxformType
				return BxformType.indexOf('men') !== -1 ? 'men' : 'db'
			},
			"updateType": function() {
				let BxformType = this.BxformType
				return BxformType.indexOf('add') !== -1 ? 'add' : BxformType.indexOf('update') !== -1 ? 'update' :
					BxformType.indexOf('detail') !== -1 ? 'detail' : 'detail'
			}
		},
		methods: {
			evalXIf(e) {
				let row = this.fieldModel
				if (e.x_if) {
					return eval("var fun=" + e.x_if + "(row); fun")
				} else {
					return true
				}
			},
			getFieldSupportConfig() {
				let config = this.fieldSupportConfig
				let formType = this.BxformType
				let fields = this.allField
				let fieldsColType = this.allField.map((item) => {
					return item.type
				})
				let support = []
				for (let type in fieldsColType) {
					if (config.indexOf(fieldsColType[type]) === -1 && formType.indexOf('detail') == -1 && !this.allField[
							type].disabled) {
						support.push(this.allField[type])
					}
				}

				console.log("get Field Support Config", config, support)
				if (support.length > 0) {
					return false
				} else {
					return true
				}
				// if()
			},
			pickerchange(oriData) {
				console.log('oriData------', oriData, this.allField);
				let filed = this.allField;
				console.log(this.allField);
			},
			setRelationColumnValue(allField, colArr, col_relation) {
				const self = this;
				let more_config = self.more_config;
				let returnValue = null;
				switch (col_relation.value.type) {
					case 'calc': //计算
						(() => {
							let valueArr = col_relation.value.value.value.map(relationitem => {
								if (relationitem.type === 'col') {
									const finalArr = colArr.filter(col => col.column === relationitem.val);
									if (finalArr.length > 0) {
										return finalArr[0].value;
									}
								} else if (relationitem.type === 'value') {
									return Number(relationitem.val);
								}
							});
							switch (col_relation.value.value.type) {
								case 'add': //加
									valueArr.forEach(item => {
										returnValue += Number(item);
									});
									break;
								case 'sub': //减
									(() => {
										let result = 0;
										if (Array.isArray(valueArr) && valueArr.length > 0) {
											valueArr.forEach((item, index) => {
												if (index !== 0) {
													result += item;
												}
											});
											returnValue = valueArr[0] - result;
										}
									})();
									// returnValue = valueArr[0] - valueArr[1];
									break;
								case 'multi': //乘
									returnValue = 1;
									valueArr.forEach(item => {
										returnValue *= Number(item);
									});
									break;
								case 'divide': //除
									returnValue = valueArr[0] / valueArr[1];
									break;
							}
						})();
						break;
					case 'col': //字段对应值
						(() => {
							this.allField.forEach(col => {
								if (col.column === col_relation.value.value) {
									returnValue = col.value;
								}
							});
						})();
						break;
				}
				this.allField.forEach((field, index) => {
					if (col_relation.dest_col === field.column) {
						field.value = returnValue;
						this.$set(this.allField, index, field);
					}
				});
			},
			setShowExp() {},
			async setCallbackColumnValue(serviceCall, condition) {
				let url = this.getServiceUrl(serviceCall.app, serviceCall.service, 'select');
				let req = {
					serviceName: serviceCall.service,
					colNames: ['*'],
					condition: condition
				};
				const res = await this.$http.post(url, req);
				if (res.data.state === 'SUCCESS') {
					console.log('setCallbackColumnValue,', res.data.data);
					if (res.data.data.length > 0) {
						const resData = res.data.data[0];
						const colArr = Object.keys(resData);
						this.allField.forEach((field, index) => {
							colArr.forEach(item => {
								if (item === field.column) {
									field.value = resData[item];
									this.$set(this.allField, index, field);
								}
							});
						});
					}
				}
				return;
				let returnValue = '';
				switch (serviceCall.value.type) {
					case 'value':
						returnValue = serviceCall.value.value;
						break;
					case 'calc':
						(() => {
							let valueArr = serviceCall.value.value.value.map(serviceCallitem => {
								if (serviceCallitem.type === 'col') {
									const finalArr = this.allField.filter(col => col.column ===
										serviceCallitem.val);
									if (finalArr.length > 0) {
										return finalArr[0].value;
									}
								} else if (serviceCallitem.type === 'value') {
									return serviceCallitem.val;
								}
							});
							switch (serviceCall.value.value.type) {
								case 'add': //加
									valueArr.forEach(item => {
										returnValue += Number(item);
									});
									break;
								case 'sub': //减
									returnValue = valueArr[0] - valueArr[1];
									break;
								case 'multi': //乘
									returnValue = 1;
									valueArr.forEach(item => {
										returnValue *= Number(item);
									});
									break;
								case 'divide': //除
									returnValue = valueArr[0] / valueArr[1];
									break;
							}
						})();
						break;
					case 'col':
						(() => {
							this.allField.forEach(col => {
								if (col.column === serviceCall.value.value) {
									returnValue = col.value;
								}
							});
						})();
						break;
				}
				this.allField.forEach((item, index) => {
					if (item.column === serviceCall.dest_col) {
						item.value = returnValue;
						this.$set(this.allField, index, item);
					}
				});
			},
			onItemButtons(e) {
				this.$emit('on-form-item', e);
				return e;
			},
			getAllField() {
				let self = this;
				if (this.fields.length > 0) {
					let fields = this.fields;
					this.oldField.forEach((item, index) => {
						this.oldFieldModel[item.column] = item.value;
					});
					this.allField = fields.map((itemData, index) => {
						if(itemData.initValue && !itemData.value ){
							itemData.value = itemData.initValue
						}
						this.fieldModel[itemData.column] = itemData.value;
						let item = this.fieldModel;
						if (itemData.hasOwnProperty('option_list_v2')) {
							if (itemData.option_list_v2 &&
								typeof itemData.option_list_v2.srv_app_exp === 'object' &&
								itemData.option_list_v2.srv_app_exp.type === 'column' &&
								itemData.option_list_v2.srv_app_exp.value &&
								item[itemData.option_list_v2.srv_app_exp.value]
							) {
								itemData.option_list_v2.srv_app = item[itemData.option_list_v2.srv_app_exp.value];
							}
							if (itemData?.option_list_v2?.conditions) {
								let conditions = itemData.option_list_v2.conditions;
								conditions = conditions.map(cond => {
									if (cond.value_exp && cond.value_exp.type === 'column' && cond
										.value_exp.value) {
										if (item[cond.value_exp.value]) {
											cond.value = item[cond.value_exp.value];
										}
									}
									return item;
								});
							}
						}
						if (itemData.hasOwnProperty('isShowExp') && item.hasOwnProperty(itemData.column)) {
							itemData['showExp'] = this.evalInTo(itemData, item);
							itemData['display'] =
								itemData.isShowExp && itemData.isShowExp.length > 0 ? this.colItemShowExps(
									itemData, item) && itemData.display : itemData.display === false ? false :
								true;
						} else {
							itemData['showExp'] = itemData['showExp'] || true;
						}
						if (itemData.formulaShow) {
							itemData['showExp'] = evaluatorTo(item, itemData.formulaShow);
							itemData['display'] = itemData['showExp'];
						}
						this.specialCol.forEach(special => {
							if (special.column === itemData.column) {
								special.value ? (this.fieldModel[itemData.column] = special.value) : '';
								special.value ? (itemData['value'] = special.value) : '';
								special.disabled ? (itemData['disabled'] = special.disabled) : '';
								special.display ? (itemData['display'] = special.display) : '';
							}
						});
						return itemData;
					});
					// console.log('0000000000000000', this.allField);
				}
			},
			handleRedundant(e) {
				// 处理冗余
				const moment = dayjs
				let self = this
				this.allField.forEach((item, index) => {
					if (item.redundant && typeof item.redundant === 'object') {
						//冗余
						if ((e.col_type === 'fk' || e.bx_col_type === 'fk') && e.colData && typeof e.colData ===
							'object' && Array.isArray(e.colData) !== true && Object.keys(e.colData).length > 0) {
							// 字段值冗余
							if (item.redundant.dependField === e.column) {
								if (item.redundant.trigger === 'always') {
									item.value = e.colData[item.redundant.refedCol];
								} else if (item.redundant.trigger === 'isnull') {
									if (!item.value) {
										item.value = e.colData[item.redundant.refedCol];
									}
								}
								if (e.colData[`_${item.redundant.refedCol}_disp`]) {
									item.valueForDisplay = e.colData[`_${item.redundant.refedCol}_disp`]
								}else{
									item.valueForDisplay = item.value 
								}
								if (item.option_list_v2 && item.option_list_v2.refed_col) {
									let cond = [{
										colName: item.option_list_v2.refed_col,
										ruleType: 'like',
										value: item.value
									}]
									self.$refs.fitem[index].getTreeSelectorData(cond)
								}
							}
						}
						if (item.redundant.func) {
							//  处理Js计算冗余
							let row = this.fieldModel
							row._children = e.childDatas?e.childDatas:self.childDatas
							if (item.redundant.trigger === 'always') {
								item.value = eval("var fun=" + item.redundant.func + "(row,self); fun")
							}
						}
					}
					this.fieldModel[item.column] = item.value;
				});
				this.allField.forEach((item, index) => {
					if (item.redundant && typeof item.redundant === 'object' && item.redundant.func) {
						//  处理Js计算冗余
						let row = this.fieldModel
						row._children = e.childDatas?e.childDatas:self.childDatas
						if (item.redundant.trigger === 'always') {
							item.value = eval("var fun=" + item.redundant.func + "(row,self); fun")
						}
					}
					this.fieldModel[item.column] = item.value;
				});
			},
			onValChange(e) {
				const self = this;
				if (e.type === 'number' || e.type === 'digit') {
					this.fieldModel[e.column] = Number(e.value);
				} else {
					this.fieldModel[e.column] = e.value;
				}
				e.value = this.fieldModel[e.column];
				const fieldModel = this.deepClone(this.fieldModel);
				this.allField = this.allField.map((item, index) => {
					item.display = item.isShowExp && item.isShowExp.length > 0 ? this.colItemShowExps(item, this
						.fieldModel) : item.display === false ? false : true;
					if (item.column === e.column) {
						item.value = e.value;
						item.valid = e.valid;
					}
					if (item.formulaShow) {
						item.display = evaluatorTo(fieldModel, item.formulaShow);
					}
					return item;
				});

				if (Array.isArray(this.more_config.col_relation) && this.more_config.col_relation.length > 0) {
					this.more_config.col_relation.forEach(col_relation => {
						// if (col_relation.watch_col.includes(e.column)) {
						//当前字段是监控字段
						if (col_relation.watch_col.some(item => e.column === item)) {
							//当前改变值的字段存在于watch_col中
							let colArr = this.allField.filter(field => col_relation.watch_col.includes(field
								.column));
							if (colArr.every(item => item.value)) {
								self.setRelationColumnValue(self.allField, colArr, col_relation);
							}
						}
					});
				}
				if (Array.isArray(this.more_config.service_call_cfg) && this.more_config.service_call_cfg.length > 0) {
					this.more_config.service_call_cfg.forEach(serviceCallCfg => {
						if (serviceCallCfg.watch_col.some(item => e.column === item)) {
							//当前字段是监控字段
							//拿到所有监控字段的数据
							let colArr = this.allField.filter(field => serviceCallCfg.watch_col.includes(field
								.column));
							//所有监控字段都有值
							if (colArr.every(item => item.value)) {
								if (serviceCallCfg.req.condition) {
									let condition = [];
									serviceCallCfg.req.condition.forEach(cond => {
										if (cond.value.valueType && cond.value.valueType === 'rowData' &&
											cond.value.valueKey) {
											condition.push({
												colName: cond.colName,
												ruleType: 'eq',
												value: fieldModel[cond.value.valueKey]
											});
										}
									});
									self.setCallbackColumnValue(serviceCallCfg, condition);
								}
							}
						}
					});
				}
				this.handleRedundant(e)

				this.$emit('value-blur', e, this.fieldModel);
			},
			onValBlur(e) {
				console.log('e', e, this.fieldModel, this.fieldModel[e.column]);
				this.fieldModel[e.column] = e.value;
				this.$emit('value-blur', e, this.fieldModel);
			},
			getDetailfieldModel() {
				return this.fieldModel;
			},
			getFieldModel() {
				console.log(this.fieldModel, 'getFieldModel');
				let valid = 0;
				let showsNum = 0;
				let formType = this.BxformType
				let allField = this.allField.filter(item => this.evalXIf(item))
				allField.map((item, index) => {
					let valids = this.$refs.fitem[index].getValid();
					if (item.display) {
						showsNum++;
						if (valids.valid) {
							valid++;
						}
					}
				});
				console.log(valid, showsNum);
				let onFieldKeys = this.allFieldRun.map((item) => {
					if (formType === 'update') {
						if (item.disabled == false||item.redundant||item.col_type==='fk') {
							return item.column
						}
					} else {
						return item.column
					}
				})
				if (valid === showsNum) {
					console.log('表单校验通过', showsNum, valid, this.fieldModel);
					let model = {};
					switch (this.pageType) {
						case 'update':
							for (let key in this.fieldModel) {
								if (this.oldFieldModel[key] !== this.fieldModel[key] && onFieldKeys.indexOf(key) !== -1) {
									model[key] = this.fieldModel[key];
								}
							}
							break;
						case 'add':
							for (let key in this.fieldModel) {
								if (this.fieldModel[key] === '' && key !== 'openid') {
									delete this.fieldModel[key];
								}
							}
							model = this.fieldModel;
							break;
						default:
							model = this.fieldModel;
							break;
					}
					console.log('this.fieldModel', this.fieldModel, model);
					if (Object.keys(model).length > 0) {
						return model;
					} else {
						// 没有需要提交的数据
						return model;
					}
				} else {
					console.log('表单校验失败', showsNum, valid, this.fieldModel);
					uni.showToast({
						title: '请填写完信息并确认格式无误后，再尝试提交',
						icon: 'none'
					});
					return false;
				}
			},
			getCascaderVal(val) {
				if (val) {
					this.$emit('get-cascader-val', val);
				} else {
					this.$emit('get-cascader-val');
				}
			},
			showOptionlist(e) {
				this.$emit('show-option-list', e);
			},
			onReset() {
				this.allField = this.deepClone(this.oldField);
				console.log(this.oldField, 'this.oldField');
				try {
					return true;
				} catch (e) {
					return false;
					//TODO handle the exception
				}
			}
		},
		watch: {
			fields: {
				handler: function(newval, old) {
					// console.log('newval', newval, this.allField);
					this.getAllField();
				},
				deep: true
			},
			moreConfig: {
				handler: function(newval, old) {
					if (newval) {
						this.more_config = this.deepClone(newval);
					}
				},
				deep: true
			},
			fieldModel: {
				deep: true,
				handler(newVal, oldVal) {}
			}
		}
	};
</script>

<style lang="less">
	.form-title {
		padding: 10upx 20upx;
		border-left: 8upx solid #0081FF;
		line-height: 36upx;
		border-bottom: 2upx solid #f2f2f2;
	}
</style>
