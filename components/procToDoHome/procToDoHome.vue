<template>
	<view class="home">
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				{{title}}  
			</view>
			<view class="action" @click="goClockIn" v-if="">
				测试打卡定位
			</view>
			<view class="action">
				<button class="cu-btn cuIcon" @click="toUserPage">
					<text class="text-blue text-lg cuIcon-myfill"></text>

				</button>
			</view>
		</view>
		<view v-for="(app,index) in menuListRun" :key="index">

			<view class="cu-bar bg-white solid-bottom" v-if="app.menus.length>0">
				<view class="action text-black text-blod">
					<text class="cuIcon-title text-orange "></text>
					{{app.title}}
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
			"menuListRun": function() {
				let self = this
				return this.appMenu.map(item => {
					if (!item.menus || !Array.isArray(item.menus)) {
						item.menus = []
					}
					return item
				})

				// menus = menus.filter((item) => {
				// 	let arr = item.menus || []
				// 	if (arr.length > 0) {
				// 		return item
				// 	} else {
				// 		item.menus = []
				// 		return item
				// 	}
				// })
				// return menus
			},
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
		onShow() {
			this.getApps()
		},
		methods: {
			goClockIn(){
				uni.navigateTo({
					url:"/pages/specific/checkIndex/checkIndex"
				})
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
			tolist(e, app) {
				let getUrlApp = function(e){
					let url = e
					let sLen = 0
					let eLen = 0
					let app = null
					let arr = []
					if(e.indexOf('destApp=') !== -1 || e.indexOf('srvApp=') != -1){
						
						sLen = e.indexOf('destApp=') == -1 ?  e.indexOf('srvApp=') != -1 ? 0 : e.indexOf('srvApp=') : e.indexOf('destApp=')
						let arr = e.split('destApp=') || e.split('srvApp=')
						if(arr.length > 1){
							if(arr[1].indexOf("&") == -1){
								app = arr[1]
							}else{
								arr = arr[1].split("&")
								app = arr[0]
							}
						}else{
							arr = e.split('srvApp=')
							if(arr.length > 1){
								if(arr[1].indexOf("&") == -1){
									app = arr[1]
								}else{
									arr = arr[1].split("&")
									app = arr[0]
								}
							}else{
								
							}
						}
						
					}
					return app
				}
				let urlApp = null
				urlApp = e.app_dest_page ? getUrlApp(e.app_dest_page) : null
				uni.setStorageSync("activeApp", urlApp ? urlApp : app)
				if(e.app_dest_page && e.app_dest_page.indexOf('/') !== -1 ){
					console.log("to",e.app_dest_page + "?destApp=" + app + "&serviceName=" + e.service_name)
					// let toUrl = e.app_dest_page + "?destApp=" + app + "&serviceName=" + e.service_name
					let toUrl = e.app_dest_page + (e.app_dest_page.indexOf("?destApp=") == -1 ? ("?destApp=" + app) : '')   + "&serviceName=" + e.service_name 
					// uni.navigateTo({
					// 	url:"pages/specific/vxHome/vxHome",
					// 	fail:function(fail){
					// 		console.log(fail)
					// 	},
					// 	complete:function(complete){
					// 		console.log(complete)
							
					// 	}
					// }) 
					console.log("tourl",toUrl)
					uni.navigateTo({
						url:toUrl,
						fail:function(fail){
								console.log('fail',fail)
							},
							complete:function(complete){
								console.log(complete)
								
							}
					})
					///pages/sepecific/clockIn/clockIn
				}else{
					uni.navigateTo({
						url: "/pages/public/proc/procList/procList?destApp=" + app + "&serviceName=" + e.service_name
					})
				}
				
			},
			async getApps() {
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
							if(item.app_no == 'vxhr'){
								console.log("vxhr res",res)
							}
							for (let i = 0; i < res.length; i++) {
								if (res[i].client_type.indexOf('APP') !== -1 && res[i]
									.app_icon) {
									self.fileNos.push(res[i].app_icon)
									
									
									if(res[i].menu_no == 'vx_attend_app'){
										console.log('res [i ]',res[i])
									}
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
