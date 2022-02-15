<template>
  <view class="home">
    <view class="cu-bar bg-white solid-bottom margin-top">
      <view class="action">
        {{title}}
      </view>
      <view class="action">
        <button class="cu-btn cuIcon" @click="toUserPage">
          <text class="text-blue text-lg cuIcon-myfill"></text>

        </button>
      </view>
    </view>
    <view v-for="(app,index) in topMenus" :key="index">

      <view class="cu-bar bg-white solid-bottom" v-if="app.menus.length>0">
        <view class="action text-black text-blod">
          <text class="cuIcon-title text-orange "></text>
          {{app.menu_name}}
        </view>
      </view>

      <view class="cu-list grid" :class="'no-border'" style="min-height: 100upx;" v-if="app.menus.length>0">
        <view class="bg-white padding-sm grid-item" v-for="(menu,i) in app.menus" :key="i"
          @click="tolist(menu,app.name)">
          <view class="grid  bg-gradual-blue radius text-center shadow-blur">
            <image v-show="menu.app_icon" class="menu-icon" :src="getIconPath(menu)" mode="scaleToFill"></image>
            <text v-show="!menu.app_icon">{{sliceString(menu.menu_name,1,'pu',false)}}</text>
            <view class="cu-tag badge" v-if="menu.wait_tip_service">
              {{menu.wait_tip_service ? menu.wait_tip_service > 99 ? "99+" : menu.wait_tip_service : ''}}
            </view>
          </view>
          <text style="font-size: 20rpx;"
            :class="{'no-wrap':menu.menu_name&&menu.menu_name.length<5}">{{sliceString(menu.menu_name,8,'pu',false)}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  import bxGrid from '@/components/bx-grid/bx-grid.vue'
  export default {
    components: {
      bxGrid
    },
    props: {
      title: {
        type: String,
        default: ''
      },
      datas: {
        type: Array,
        default: function() {
          return []
        }
      },
      type: {
        type: String,
        default: ""
      },
      showAllMenu: {
        type: Boolean,
        default: false
      },
      onlyShowTip: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        appMenu: [],
        menuIconFiles: [],
        fileNos: []
      }
    },
    computed: {
      topMenus() {
        // 顶级菜单
        if (Array.isArray(this.appMenu)) {
          let topMenus = this.appMenu.filter(item => item.parent_no == null)
          topMenus = topMenus.map(menu => {
            if (!this.onlyShowTip) {
              menu.menus = this.appMenu.filter(item => item.is_leaf === '是' && item.path.indexOf(
                `/${menu.menu_no}`) === 0)
            } else {
              menu.menus = this.appMenu.filter(item => item.is_leaf === '是' && item.path.indexOf(
                `/${menu.menu_no}`) === 0 && item.wait_tip_service)
            }

            return menu
          })
          return topMenus
        }
      },
      // "menuListRun": function() {
      //   let self = this
      //   return this.appMenu.map(item => {
      //     if (!item.menus || !Array.isArray(item.menus)) {
      //       item.menus = []
      //     }
      //     return item
      //   })
      // },
      "userName": function() {
        let name = uni.getStorageSync('login_user_info')
        return name.user_disp
      },
      fileListRun: function() {
        let icons = this.getAppIcon(self.fileNos)
        return this.menuIconFiles
      }
    },
    created() {
      this.getApps()
    },
    methods: {
      async getUserMenu() {
        const req = {
          "serviceName": "srvsys_user_menu_select",
          "colNames": ["*"],
          "condition": [{
            "colName": "client_type",
            "ruleType": "like",
            "value": "APP"
          }],
          "order": [{
            "colName": "seq",
            "orderType": "asc"
          }]
        }
        let res = await this.onRequest("select", "srvsys_user_menu_select", req, "corp")
        if (res?.data?.state === 'SUCCESS') {
          this.appMenu = res.data.data
        }
      },
      getIconPath(e) {
        let self = this
        let token = uni.getStorageSync('bx_auth_ticket')
        let host = self.$api.srvHost
        let files = self.menuIconFiles || []
        let url = e.app_icon
        return `${host}/file/download?fileNo=${url}&bx_auth_ticket=${token}`
      },
      async getAppIcon(e) {
        let self = this
        let nos = self.fileNos
        await self.getFilePath(nos.toString()).then((res) => {
          self.menuIconFiles = res
        })
        console.log("getAppIcon", self.menuIconFiles)
      },
      tolist(e, app = 'corp') {
        debugger
        uni.setStorageSync("activeApp", app)
        let url = `/pages/public/list/list?destApp=${app}&serviceName=${e.service_name}&pageType=list`
        if (e?.app_dest_page === 'listproc') {
          url = "/pages/public/proc/procList/procList?destApp=" + app + "&serviceName=" + e.service_name
        }
        if(e.app_dest_page){
          url = e.app_dest_page
        }
        uni.navigateTo({
          url
        })
      },
      async getApps() {
        this.getUserMenu()
        return 
        let self = this
        let req = {
          "serviceName": "srvauth_user_app_menu_select",
          "colNames": ["*"]
        }
        let res = await self.onRequest("select", "srvauth_user_app_menu_select", req, "auth")
        // .then((res) => {
        console.log("appmenu1", res)
        if (res.data.state === 'SUCCESS' && res.data.data.length > 0) {
          let menus = self.arraySort(res.data.data, "app_seq")
          self.appMenu = menus.map((item, index) => {
            let a = {
              title: "",
              name: "",
              icon: "",
              seq: "",
              link: "",
              type: "button",
              menus: []
            }
            a.title = item.app_name
            a.name = item.app_no
            a.icon = item.app_icon
            a.seq = item.app_seq
            a.class_no = item.class_no
            a.class_name = item.class_name
            self.getAppMenu(item.app_no).then((res) => {

              for (let i = 0; i < res.length; i++) {
                if (res[i].client_type.indexOf('APP') !== -1 && res[i]
                  .app_icon) {
                  self.fileNos.push(res[i].app_icon)
                }
              }
              res = res.filter((item) => {
                // if (item.client_type.indexOf('APP') !== -1) {
                if (self.showAllMenu) {
                  return item.client_type.indexOf('APP') !== -1
                } else {
                  return item.client_type.indexOf('APP') !== -1 && item
                    .wait_tip_service
                }
                // if (item.client_type.indexOf('APP') !== -1 && item.wait_tip_service) {
                // 	return item
                // }
              })
              self.$set(a, 'menus', res)
            })
            // a.link = item.class_name
            // a.type = item.class_name

            return a
          })

        }
        // })
        console.log("appmenu2", this.appMenu)
      },
      async getAppMenu(app) {
        let req = {
          "serviceName": "srvsys_user_menu_select",
          "colNames": ["*"],
          "order": [{
            "colName": "seq",
            "orderType": "asc"
          }]
        }
        let url = this.$api.serverURL + `/${app}/select/srvsys_user_menu_select`
        return this.$http.post(url, req).then((res) => {
          let datas = res.data.data
          datas = datas.filter((item) => item.is_leaf === '是')
          return datas
        })
      },
      toUserPage() {
        uni.navigateTo({
          url: "/pages/public/user/user"
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .home {
    min-height: 100vh;
    background-color: #fff;
  }

  .no-wrap {
    white-space: nowrap;
  }

  .scale-8 {
    display: inline-block;
    transform: scale(0.8);
  }

  .grid-item {
    width: 18.8vw;

    .grid {
      width: 100upx;
      height: 100upx;
      border-radius: 10upx;
      // overflow: hidden;
      text-align: center;



      .menu-icon {
        width: 100upx;
        height: 100upx;
        border-radius: 10upx;
        overflow: hidden;
      }
    }
  }
</style>
