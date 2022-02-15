<template>
	<view>
		<cu-custom bgColor="bg-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">个人信息</block>
		</cu-custom>
		<view class="cu-card dynamic" :class="'no-card'">
			<view class="cu-item shadow">
				<view class="cu-list menu-avatar comment solids-top">
					<view class="cu-item">
						<view class="cu-avatar round bg-white" >
							
							<text  class="lg text-gray cuIcon-profile"></text>
						</view>
						<view class="content">
							<view class="text-black">姓名/工号：{{userInfo && userInfo.person_name ? userInfo.person_name : '-'}}/{{userInfo && userInfo.user_code ? userInfo.user_code : '-'}}</view>
							<view class="text-black text-content text-df">
								入职时间：{{userInfo && userInfo.entry_date ? userInfo.entry_date : '-'}}
							</view>
							<view class="text-black text-content text-df">
								职位名称：{{userInfo && userInfo._job_disp ? userInfo._job_disp : '-'}}
							</view>
							<view class="text-black text-content text-df">
								所属部门：{{userInfo && userInfo._dept_no_disp? userInfo._dept_no_disp : '-'}}
							</view>
						</view>
					</view>
				</view>
				<view class="cu-list menu-avatar comment solids-top">
					<view class="">
						<view class="cu-timeline">
							<!-- <view class="cu-time">昨天</view> -->
							<view class="cu-item cur cuIcon-noticefill">
								<view class="content bg-green shadow-blur">
									<text>{{userInfo && userInfo.positive_confirm_date ? userInfo.positive_confirm_date : '-'}}</text> 【我转正了】
								</view>
							</view>
							<view class="cu-item cur cuIcon-noticefill">
								<view class="content bg-green shadow-blur">
									<text>{{userInfo && userInfo.entry_date ? userInfo.entry_date : '-'}}</text> 【我入职了】
								</view>
							</view>
							
						</view>
					</view>
						
				</view>
			</view>
		</view>
		<view class="padding flex flex-direction">
			<button class="cu-btn bg-red margin-tb-sm lg" @click="goToLogin">切换账号</button>
			<button v-if="isBind" class="cu-btn bg-red margin-tb-sm lg" @click="unBindWxUser">解绑</button>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				toDoList:[],
				userInfo:null,
			};
		},
		computed:{
			userToDoPanl:function(){
				let list = this.toDoList
				let str = ''
				let arrObj = {}
				list.forEach((item)=>{
					if(arrObj.hasOwnProperty(item.appno)){
						arrObj[item.appno].push(item)
					}else{
						arrObj[item.appno] = []
						arrObj[item.appno].push(item)
					}
					// if(str.indexOf(item.appno) === -1){
					// 	str === ''? str += item.appno : str+= "$" + item.appno
					// }
				})
				return arrObj
			},
			isBind:function(){
				let isBind = uni.getStorageSync('login_user_info').login_user_type
				if(isBind === 'user' && uni.getStorageSync('client_env') == 'wxh5'){
					return true
				}else{
					return false
				}
			}
		},
		methods:{
			getUserToDo(e){
				let url = this.$api.getUserToDo
				let req = {"serviceName":"srvsso_process_todo_select","colNames":["*"],"condition":[],"relation_condition":{},"page":{"pageNo":1,"rownumber":1000},"order":[],"draft":false}
				this.$http.post(url,req).then(res=>{
					console.log('getUserToDo',res)
					this.toDoList = res.data.data
				})
			},
			goToLogin(){
				uni.setStorageSync("isLogin",false)
				uni.reLaunch({
					url:"/pages/public/accountExec/accountExec"
				})
			},
			unBindWxUser(){
				let self = this
				let url = self.$api.unbindWxUser;
				let reqData = [{
					"serviceName":"srvwx_user_unbind"
				}]
				
				uni.showModal({
				    title: '提示',
				    content: '是否继续解除绑帐号？',
					cancelText: "不用了",
					confirmText: "是",
				    success: function (res) {
				        if (res.confirm) {
				            self.$http.post(url,reqData).then(res=>{
				            	console.log('unBindWxUser',reqData)
				            	// this.toDoList = res.data.data
								uni.setStorageSync('isLogin', false);
				            	uni.reLaunch({
				            		url:"/pages/public/accountExec/accountExec"
				            	})
				            })
				        } else if (res.cancel) {
				            console.log('用户点击取消');
							
				        }
				    }
				});
				
			},
			getUserInfo(){
				let url = this.$api.serverURL + '/vxhr/select/srvvx_personal_basic_info_select'
				let req = {"serviceName":"srvvx_personal_basic_info_select","colNames":["*"],"condition":[{"colName":"user_no","ruleType":"eq","value":uni.getStorageSync('login_user_info').user_no}],"relation_condition":{},"page":{"pageNo":1,"rownumber":4},"order":[],"draft":false}
				this.$http.post(url,req).then(res=>{
					console.log('getUserInfo',res)
					this.userInfo = res.data.data[0]
				})
			}
		},
		onLoad() {
			this.getUserToDo()
			this.getUserInfo()
		}
	}
</script>

<style lang="less">

</style>
