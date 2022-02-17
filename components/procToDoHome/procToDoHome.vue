<template>
  <view class="home">
    <view class="cu-bar bg-white solid-bottom ">
      <view class="action text-bold text-black">
        {{title}}
      </view>
      <view class="action">
        <view class="text-black user-info margin-right" v-if="userInfo && (userInfo.person_name||userInfo.user_code)">
          {{userInfo && userInfo.person_name || '-'}}/{{userInfo && userInfo.user_code|| '-'}}
        </view>
        <button class="cu-btn cuIcon" @click="toUserPage">
          <text class="text-blue text-lg cuIcon-myfill"></text>
        </button>
      </view>
    </view>
    <view class="menus-box">
      <uni-collapse>
        <uni-collapse-item :showArrow="true" :title="app.menu_name" :open="app.showCollapse" :name="app.menu_no"
          v-for="(app,index) in topMenus" :key="index" >
          <template v-slot:title  v-if="app.menus.length>0">
            <view class="cu-bar bg-white ">
              <view class="action text-black text-blod">
                <text class="cuIcon-title text-orange "></text>
                {{app.menu_name}}
              </view>
             <!-- <view class="">
                <text class="cuIcon-right"></text>
              </view> -->
            </view>
          </template>
          <view class="cu-list grid" :class="'no-border'"
            style="min-height: 100upx; transition: height .2s ease-in-out;" v-if="app.menus.length>0">
            <view class="bg-white padding-sm grid-item" v-for="(menu,i) in app.menus" :key="i"
              @click="tolist(menu,app.name)">
              <view class="grid text-center shadow-blur">
                <image v-show="menu.app_icon" class="menu-icon " :src="getIconPath(menu)" mode="scaleToFill"></image>
                <view v-show="!menu.app_icon" class="menu-icon-text">
                  <text class="text" v-for="item in getMenuText(menu.menu_name)">
                    {{item}}
                  </text>
                </view>
                <view class="cu-tag badge" v-if="menu.wait_tip_service">
                  {{menu.wait_tip_service ? menu.wait_tip_service > 99 ? "99+" : menu.wait_tip_service : ''}}
                </view>
              </view>
              <text style="font-size: 20rpx;"
                :class="{'no-wrap':menu.menu_name&&menu.menu_name.length<5}">{{sliceString(menu.menu_name,8,'pu',false)}}</text>
            </view>
          </view>
        </uni-collapse-item>
      </uni-collapse>
    </view>
    <!-- <view v-for="(app,index) in topMenus" class="solid-bottom" :key="index">
      <view class="cu-bar bg-white solid-bottom" v-if="app.menus.length>0" @click="changeDisp(app,index)">
        <view class="action text-black text-blod">
          <text class="cuIcon-title text-orange "></text>
          {{app.menu_name}}
        </view>
      </view>
      <view class="cu-list grid" :class="'no-border'" style="min-height: 100upx; transition: height .2s ease-in-out;"
        v-show="app.showCollapse" v-if="app.menus.length>0">
        <view class="bg-white padding-sm grid-item" v-for="(menu,i) in app.menus" :key="i"
          @click="tolist(menu,app.name)">
          <view class="grid text-center shadow-blur">
            <image v-show="menu.app_icon" class="menu-icon " :src="getIconPath(menu)" mode="scaleToFill"></image>
            <view v-show="!menu.app_icon" class="menu-icon-text">
              <text class="text" v-for="item in getMenuText(menu.menu_name)">
                {{item}}
              </text>
            </view>
            <view class="cu-tag badge" v-if="menu.wait_tip_service">
              {{menu.wait_tip_service ? menu.wait_tip_service > 99 ? "99+" : menu.wait_tip_service : ''}}
            </view>
          </view>
          <text style="font-size: 20rpx;"
            :class="{'no-wrap':menu.menu_name&&menu.menu_name.length<5}">{{sliceString(menu.menu_name,8,'pu',false)}}</text>
        </view>
      </view>
    </view> -->
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
        fileNos: [],
        userInfo: {},
        topMenus: [], //顶级菜单
      }
    },
    computed: {
      // topMenus() {
      //   // 顶级菜单
      //   if (Array.isArray(this.appMenu)) {
      //     let topMenus = this.appMenu.filter(item => item.parent_no == null)
      //     topMenus = topMenus.map(menu => {
      //       if (menu.is_leaf === '是') {
      //         menu.menus = [menu]
      //         return menu
      //       }
      //       if (!this.onlyShowTip) {
      //         menu.menus = this.appMenu.filter(item => item.is_leaf === '是' && item.path.indexOf(
      //           `/${menu.menu_no}`) === 0)
      //       } else {
      //         menu.menus = this.appMenu.filter(item => item.is_leaf === '是' && item.path.indexOf(
      //           `/${menu.menu_no}`) === 0 && item.wait_tip_service)
      //       }

      //       return menu
      //     })
      //     return topMenus
      //   }
      // },
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
    mounted() {
      this.getUserInfo()
    },
    methods: {
      changeDisp(app, index) {
        app.showCollapse = !app.showCollapse
        this.$set(this.topMenus, index, app)
      },
      getUserInfo() {
        let login_user_info = uni.getStorageSync('login_user_info')
        if (login_user_info?.user_no) {
          let app = uni.getStorageSync('activeApp') || 'vxhr'
          let url = this.$api.serverURL + `/${app}/select/srvvx_personal_basic_info_select`
          let req = {
            "serviceName": "srvvx_personal_basic_info_select",
            "colNames": ["*"],
            "condition": [{
              "colName": "user_no",
              "ruleType": "eq",
              "value": login_user_info.user_no
            }],
            "page": {
              "pageNo": 1,
              "rownumber": 1
            }
          }
          this.$http.post(url, req).then(res => {
            this.userInfo = res.data.data[0]
          })
        }
      },
      getMenuText(e, length = 4) {
        if (e) {
          return e.split('').slice(0, length)
        }
      },
      async getUserMenu() {
        let self = this
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
          if (Array.isArray(this.appMenu)) {
            let topMenus = this.appMenu.filter(item => item.parent_no == null).map((item, index) => {
              if (index < 3) {
                item.showCollapse = true
              } else {
                item.showCollapse = false
              }
              return item
            })
            topMenus = topMenus.map(menu => {
              if (menu.is_leaf === '是') {
                menu.menus = [menu]
                return menu
              }
              if (!this.onlyShowTip) {
                menu.menus = this.appMenu.filter(item => item.is_leaf === '是' && item.path.indexOf(
                  `/${menu.menu_no}`) === 0)
              } else {
                menu.menus = this.appMenu.filter(item => item.is_leaf === '是' && item.path.indexOf(
                  `/${menu.menu_no}`) === 0 && item.wait_tip_service)
              }

              return menu
            })
            this.topMenus = topMenus
          }
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
        uni.setStorageSync("activeApp", app)
        let url = `/pages/public/list/list?destApp=${app}&serviceName=${e.service_name}&pageType=list`
        if (e?.app_dest_page === 'listproc') {
          url = "/pages/public/proc/procList/procList?destApp=" + app + "&serviceName=" + e.service_name
        } else if (e.app_dest_page) {
          url = e.app_dest_page
        }
        if (!e.app_dest_page && !e.service_name) {
          uni.showModal({
            title: '提示',
            content: '请配置菜单的【对应服务】或【app目标页面】',
            showCancel: false
          })
          return
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

  .menus-box {
    // padding: 10px;
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
      width: 100rpx;
      height: 100rpx;
      border-radius: 10upx;
      // overflow: hidden;
      text-align: center;


      .menu-icon-text {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        width: 100rpx;
        height: 100rpx;
        background-color: #0088fe;
        color: #fff;
        border-radius: 15px;
        padding: 5px;

        .text {
          width: 40%;
          // font-weight: bold;
          // display: flex;
          // justify-content: flex-end;
          // &:nth-child(2n){
          //   justify-content: flex-start;
          // }
        }
      }

      .menu-icon {
        width: 100rpx;
        height: 100rpx;
        border-radius: 10upx;
        overflow: hidden;
      }
    }
  }
</style>
