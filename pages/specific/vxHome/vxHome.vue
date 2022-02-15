<template>
	<view>
		<view class="bg-img flex align-center" :style="{backgroundImage:`url(${login})`,height:'296upx'}">
		</view>
		<userProc :title="title" ref="toDoHome" :showAllMenu="showAllMenu"></userProc>
	</view>
</template>

<script>
	import loginimg from '@/static/icon/vxlogo.jpg'
	import userProc from '@/components/procToDoHome/procToDoHome.vue'
	export default {
		data() {
			return {
				login:`${loginimg}`,
				title:"万像风险管理系统",
				showAllMenu:false,
			};
		},
		components:{userProc},
		onPullDownRefresh() {
			if(this.$refs.hasOwnProperty('toDoHome') && this.$refs.toDoHome.hasOwnProperty('getApps')){
				this.$refs.toDoHome.getApps()
			}
			setTimeout(()=>{
				uni.stopPullDownRefresh()
			},2000)
		},
		onLoad(option) {
			if(option.showAllMenu){
				this.showAllMenu = true
			}
		},
		onShow() {
			// if(this.$refs.hasOwnProperty('toDoHome') && this.$refs.toDoHome.hasOwnProperty('getApps')){
			// 	this.$refs.toDoHome.getApps()
			// }
		}
	}
</script>

<style lang="less">

</style>
