<template>
	<view>
		<bxform ref="bxForm" :pageType="type" :BxformType="type" :fields="fields"></bxform>
	</view>
</template>

<script>
import bxform from '@/components/bx-form/bx-form.vue';
export default {
	components: {
		bxform
	},
	data() {
		return {
			type: 'add',
			fields: [
				{
					label: '姓名',
					column: 'name',
					value: '',
					type: 'input',
					isRequire: true,
					isShowExp: [],
					
					options: []
				},
				{
					label: '户籍所在地',
					column: 'id_card_addr',
					value: '',
					type: 'input',
					isRequire: true,
					isShowExp: [],
					options: []
				},
				{
					label: '身份证号',
					column: 'id_card_no',
					value: '',
					type: 'input',
					isRequire: true,
					isShowExp: [],
					options: []
				},
				{
					label: '体温',
					column: 'temperature',
					value: '',
					type: 'digit',
					isRequire: true,
					isShowExp: [],
					options: []
				},
				{
					label: '身份证照片',
					column: 'id_card_photo',
					value: '',
					type: 'images',
					isRequire: false,
					isShowExp: [],
					moreConfig:{
						// eventType:"navTo",
						eventTarget:"/pages/public/identityCardRec/identityCardRec",
					},
					srvInfo: {
						tableName: 'bxdaq_check_car',
						appNo: 'daq'
					},
					buttonPosition:"right",
					options: []
				},
				{
					label: '车牌号',
					column: 'vehicle',
					value: '',
					type: 'input',
					isRequire: false,
					isShowExp: [],
					options: []
				},
				{
					label: '手机号',
					column: 'phone',
					value: '',
					type: 'number',
					isRequire: false,
					isShowExp: [],
					options: []
				},
				{
					label: '备注',
					column: 'remark',
					value: '',
					type: 'textarea',
					isRequire: false,
					isShowExp: [],
					options: []
				}
			]
		};
	},
	methods: {}
};
</script>

<style></style>
