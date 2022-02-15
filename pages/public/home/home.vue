<template>
	<view class="home">
		<bxGrid :gridData="appMenu" :disColName="'title'" :nodeKey="'name'" v-if="appMenu.length > 0"></bxGrid>
		<!-- <view class="" @click="target()">
			我的
		</view>
		<view class="" @click="targets()">
			商城
		</view> -->
	</view>
</template>

<script>
	import bxGrid from '@/components/bx-grid/bx-grid.vue'  
	export default {
		components:{bxGrid},
		data() {
			return {
				appMenu:[]
			}
		},
		created() {
			uni.setNavigationBarTitle({
			    title: '今日概览'
			});
			this.getAppMenu()
		},
		onShow() {
			this.getAppMenu()
		},
		methods: {
			getAppMenu(){
				let self = this
				let req = {"serviceName":"srvauth_user_app_menu_select","colNames":["*"]}
				self.onRequest("select","srvauth_user_app_menu_select",req,"auth").then((res)=>{
					console.log("appmenu1",res)
					if(res.data.state === 'SUCCESS' && res.data.data.length>0){
						self.appMenu = self.arraySort(res.data.data,"app_seq")
						self.appMenu = self.appMenu.map((item,index)=>{
							let a = {
								title:"",
								name:"",
								icon:"",
								seq:"",
								link:"",
								type:"button"
							}
							a.title = item.app_name
							a.name = item.app_no
							a.icon = item.app_icon
							a.seq = item.app_seq
							a.class_no = item.class_no
							a.class_name = item.class_name
							// a.link = item.class_name
							// a.type = item.class_name
							return a
						})
					}
				})
				console.log("appmenu2",this.appMenu)
				// https://srvms.100xsys.cn/auth/select/srvauth_user_app_menu_select
				// {"serviceName":"srvauth_user_app_menu_select","colNames":["*"]}
			}
		}
	}
</script>

<style scoped lang="scss">
.home{
  min-height: 100vh;
  background-color: #fff;
}
</style>
