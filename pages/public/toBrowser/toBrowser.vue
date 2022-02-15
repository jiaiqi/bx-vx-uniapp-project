<template>
	<view>
		<cu-custom  bgColor="bg-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">文件下载</block>
		</cu-custom>
		<view style="width: 100vw; height: 100vh;" v-if="clientEnv == 'wxh5'">
			
			<image  style="width:100vw; height: 100%;" :src="bg" mode="aspectFit"></image>
			<!-- <view class="text-lg">请点击右上角在浏览器打开下载附件。</view> -->
		</view>
		<!-- <button v-if="showBack" @click="backPage">返回</button> -->
	</view>
</template>

<script>
	import backImg from '../../../static/img/errHelp.jpg'
	export default {
		data() {
			return {
				showBack:false,
				bg:backImg,
				clientEnv:uni.getStorageSync('client_env')
				
			};
		},
		props:{
			url:{
				type:String,
				default(){
					return ''
				}
			}
		},
		computed:{
			"clientEnvRun":function(){
				let clientEnv = uni.getStorageSync('client_env')
				return clientEnv
			}
		},
		onLoad(option) {
			console.log('to Browser',option)
			if(this.clientEnv === 'wxh5'){
			        //是微信浏览器  显示返回按钮   （用户可以选择下载或者返回）
			       this.showBack = true
			    }else{
			        //不是微信浏览器
			        //执行下载
			        window.location.href=option.fileurl +  '&bx_auth_ticket=' +option.bx_auth_ticket;
			}
		},
		methods:{
			backPage(){
				uni.navigateBack({
					delta:1
				})
			},
			
			
		}
	}
</script>

<style>

</style>
