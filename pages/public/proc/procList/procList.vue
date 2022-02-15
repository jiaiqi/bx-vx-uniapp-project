<template>
  <view>
    <cu-custom bgColor="bg-blue" :isBack="true">
      <block slot="backText">返回</block>
      <block slot="content" v-if="listConfig.listConfig">{{ listConfig.listConfig.service_view_name }}</block>
      <block slot="right"><text class="cuIcon-add" style="font-size: 40upx;margin-right: 20upx;" @click="toApply"></text></block>
    </cu-custom>
    <bx-list
      v-if="listConfig.serviceName"
      ref="bxList"
      srvApp="oa"
      showLabel
      pageType="proc"
      :rowButtons="listConfig.rowButtons"
      :serviceName="listConfig.serviceName"
      :condition="listConfig.condition"
      :listType="listConfig.listType"
      :viewTemp="listConfig.viewTemp"
      :listConfig="listConfig.listConfig"
      :searchWords="listConfig.searchVal"
      :searchColumn="'name'"
      :detailList="listConfig.detailList"
      :rownumber="5"
      :fixed="true"
      :top="100"
      :heightStyle="'calc(100vh-220upx)'"
      :order="listConfig.order"
      @click-list-item="clickItem"
      @list-change="listChange"
      @clickFootBtn="clickFootBtn"
      @loadEnd="loadEnd"
    ></bx-list>
    <view class="cu-modal bottom-modal" :class="showModal ? 'show' : ''">
      <view class="cu-dialog" style="max-height: 800upx;">
        <view class="cu-bar bg-white">
          <view class="action text-green">确定</view>
          <view class="action text-blue" @tap="hideModal">取消</view>
        </view>
        <view class="padding-xl" v-if="listConfig.listConfig">
          <bxform ref="bxformApplyProc" :pageType="'add'" :fields="listConfig.listConfig.srv_cols" :BxformType="'add'" @value-blur="valueChange"></bxform>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import bxList from '@/components/bx-list/bx-list.vue';
import bxform from '@/components/bx-form/bx-form.vue';
export default {
  name: 'ProcList',
  components: { bxList, bxform },
  data() {
    return {
      publicButton: [],
      applyButton: {},
      applyFormFields: [],
      showModal: false,
      listConfig: {
        // serviceName: 'srvoa_issue_info_select',
        // addService: 'srvoa_issue_info_add',
        detailList: false,
        condition: [],
        order: [{ colName: 'create_time', orderType: 'desc' }],
        rowButtons: [],
        listType: 'proc',
        viewTemp: {
          title: 'issue_name',
          tip: '_executor_user_disp',
          img: null,
          price: 'proc_status',
          footer: 'create_time'
        },
        listConfig: null,
        searchVal: ''
      }
    };
  },
  methods: {
    hideModal() {
      this.showModal = false;
    },
    toApply() {
      // this.$refs.popup.open()
      // this.showModal = true
      uni.navigateTo({
        url: '../apply/apply?serviceName=' + this.listConfig.addService
      });
    },
    async applyFlow() {
      //申请流程
      let serviceName = this.applyButton.serviceName;
      let req = [
        {
          serviceName: serviceName,
          data: [{}]
        }
      ];
      let res = await this.onRequest('apply', serviceName, req, 'oa');
    },
    clickItem(e) {
      // console.log(e);
    },
    listChange(e) {
      // console.log(e);
    },
    clickFootBtn(e) {
      // console.log(e);
			// debugger
      if (e.button.button_type === 'edit') {
        //跳转到编辑页面
      } else if (e.button.button_type === 'delete' || e.button.button_type === 'deleteproc') {
        //删除页面
        this.deleteItem(e);
      } else if (e.button.button_type === 'procdetail') {
				let url = `../procDetail/procDetail?proc_instance_no=${e.row.proc_instance_no}`
				if(e.row.appno){
					url += `&appno=${e.row.appno}`
				}
        uni.navigateTo({
          url: url
        });
      }else{
		  uni.showToast({
		    title: '暂不支持'
		  });
	  }
    },
    deleteItem(e) {
      let proc_instance_no = e.row.proc_instance_no;
      let serviceName = e.button.service_name;
      let req = [{ serviceName: serviceName, condition: [{ colName: 'proc_instance_no', ruleType: 'eq', value: proc_instance_no }] }];
      let url = this.getServiceUrl('oa', serviceName, 'operate');
      this.$http
        .post(url, req)
        .then(res => {
          if (res.data.state === 'SUCCESS') {
            uni.showToast({
              title: '删除成功'
            });
            this.$refs.bxList.onRefresh();
          } else {
            uni.showToast({
              title: res.data.resultMessage
            });
          }
        })
        .catch(error => {
          console.error(error);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        });
    },
    loadEnd(e) {
      console.log(e);
    },
    async getListV2() {
      let app = uni.getStorageSync('activeApp');
      let serviceName = this.listConfig.serviceName;
      // app = 'oa';
      let colVs = await this.getServiceV2(this.listConfig.serviceName, 'list', 'proclist', app);
      colVs.srv_cols = colVs.srv_cols.filter(item => item.in_list === 1);
      console.log('colVs', colVs);
      if (serviceName.indexOf('issue_') !== -1) {
        colVs.rowButton = [
          {
            page_type: '流程列表',
            button_name: '流程详情',
            button_type: 'procdetail',
            service_name: 'srvoa_issue_info_select',
            service_view_name: '需求问题管理查询',
            permission: true
          }
        ];
      } else if (serviceName.indexOf('task_') !== -1) {
        colVs.rowButton = [
          {
            page_type: '流程列表',
            button_name: '流程详情',
            button_type: 'procdetail',
            service_name: 'srvoa_project_task_plan_select',
            service_view_name: '任务计划跟踪列表',
            permission: true
          }
        ];
      }

      this.listConfig.listConfig = colVs;
      this.applyFormFields = colVs;
      this.publicButton = colVs.gridButton.filter(item => {
        if (item.permission === true) {
          switch (item.button_type) {
            case 'add':
              this.showAdd = true;
              return item;
              break;
            case 'select':
              this.showSearchBar = true;
              return item;
              break;
            case 'apply':
              this.showAdd = true;
              this.applyButton = item;
              return item;
              break;
          }
        }
      });
      return colVs;
    }
  },
  mounted() {
    let activeApp = uni.getStorageSync('activeApp');
    activeApp ? '' : uni.setStorageSync('activeApp', 'oa');
	if(this.$route.query.destApp){
		uni.setStorageSync('activeApp', this.$route.query.destApp)
	}
    if (this.$route.query.serviceName) {
      this.listConfig.serviceName = this.$route.query.serviceName;
      if (this.listConfig.serviceName.indexOf('_select') !== -1) {
        this.listConfig.addService = this.listConfig.serviceName.replace('_select', '_add');
      }
      if (this.listConfig.serviceName.indexOf('project_task_plan') !== -1) {
        this.listConfig.viewTemp = {
          title: 'task_name',
          tip: 'executor',
          img: null,
          // price: 'issue_level',
          footer: 'create_time'
        };
      }
      if (this.$route.query.viewTemp) {
        this.listConfig.viewTemp = JSON.parse(decodeURIComponent(this.$route.query.viewTemp));
      }

      if (this.listConfig.serviceName.indexOf('issue_info') !== -1 || !this.$route.query.serviceName) {
        this.listConfig.addService = 'srvoa_issue_info_add';
        this.listConfig.serviceName = 'srvoa_issue_info_select';
        this.listConfig.viewTemp = {
          title: 'issue_name',
          tip: '_executor_user_disp',
          img: null,
          price: 'proc_status',
          footer: 'create_time'
        };
      }
    } else {
      this.listConfig.addService = 'srvoa_issue_info_add';
      this.listConfig.serviceName = 'srvoa_issue_info_select';
      this.listConfig.viewTemp = {
        title: 'issue_name',
        tip: '_executor_user_disp',
        img: null,
        price: 'proc_status',
        footer: 'create_time'
      };
    }
    this.getListV2();
  }
};
</script>

<style lang="scss"></style>
