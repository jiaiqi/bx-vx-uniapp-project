<template>
  <view>
    <SitePage :website_no="website_no" :page_no="currentPage.page_no" ref="sitePage" :style="{ 'padding-bottom': websiteList.length > 1 ? '100upx' : 0 }"></SitePage>
    <view class="cu-bar tabbar bg-white shadow foot" v-if="websiteList.length > 1">
      <view class="action" v-for="(item, siteIndex) in websiteList" :key="siteIndex" @click="changePage(item)">
        <!-- <view class="cuIcon-cu-image"><image src="/static/tabbar/basics_cur.png"></image></view> -->
        <view :class="{ 'text-green': item.page_no === currentPage.page_no, 'text-gray': item.page_no !== currentPage.page_no }">{{ item.page_name }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import SitePage from '../index/index';
export default {
  name: 'home-page',
  components: {
    SitePage
  },
  data() {
    return {
      website_no: '',
      currentPage: '',
      websiteList: []
    };
  },
  methods: {
    changePage(item) {
      if (item && item.page_no !== this.currentPage.page_no) {
        this.currentPage = item;
        this.$refs.sitePage.getPageInfo(item.website_no, item.page_no);
      }
    },
    async getWebsiteList() {
      const url = this.getServiceUrl('daq', 'srvdaq_website_page_select', 'select');
      const website_no = this.$route.query.website_no;
      if (website_no) {
        const req = {
          serviceName: 'srvdaq_website_page_select',
          colNames: ['*'],
          condition: [{ colName: 'website_no', ruleType: 'like', value: website_no }],
          page: { pageNo: 1, rownumber: 10 },
          order: []
        };
        const res = await this.$http.post(url, req);
        if (res.data.state === 'SUCCESS') {
          if (res.data.data.length > 0) {
            res.data.data.length > 5? res.data.data.length = 5:"";
            this.websiteList = res.data.data;
            this.currentPage = res.data.data[0];
            this.$refs.sitePage.getPageInfo(res.data.data[0].website_no, res.data.data[0].page_no);
          }
        }
      }
    }
  },
  created() {
    if (this.$route.query.website_no) {
      this.website_no = this.$route.query.website_no;
      this.getWebsiteList();
    }
  }
};
</script>

<style lang="scss"></style>
