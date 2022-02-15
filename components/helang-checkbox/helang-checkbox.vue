<template>
	<view class="container" :class="column">
		<view class="titleself">
			{{titleSelfData}}
		</view>
		<view class="allbox">
			<view class="box" v-if="v.show!=='hide'" v-for="(v,i) in list" :key="i" >
				<view 
				class="item"
				:class="{ 'active':(type=='radio' && index == i) || (type=='checkbox' && v.checked) }"
				:data-i="i"
				@tap="change"
				>{{v.text}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[],
				index:-1,
				type:'checkbox',
				column:'',
				titleSelfData:'',
				optionBd:Array,
				refz:''
			};
		},
		methods: {
			/* 切换 */
			change(e,val){
				let i = 0
				if(e.currentTarget){
					i = Number(e.currentTarget.dataset.i);
				}else if(typeof parseInt(e) =='number'){
					i= e
				}
				/* 单选框 */
				if(this.type=='radio'){
					this.index = i;
					this.$nextTick(()=>{
						this.$emit("change",this.get());
					})
					return;
				}
				/* 复选框 */
				if(this.list&&this.list[i]&&this.list[i].checked){
					this.$set(this.list[i],"checked",false);
				}else{
					if(this.maxSize){
						let pickerSize = 0;
						this.list.forEach((item,index)=>{
							if(item.checked){
								pickerSize++;
							}
						});
						// 当已选值数量 >= 允许的最大选择值时触发
						if(pickerSize >= this.maxSize){
							this.maxFn && this.maxFn();
							return;
						}
					}
					if(val){
						this.$set(this.list[e],"checked",true);
						return;
					}else{
						this.$set(this.list[i],"checked",true);
					}
					
				}
				
				this.$nextTick(()=>{
					this.$emit("change",this.get(i,val));
				});
			},
			/* 设置值 */
			set(data) {
				let [type,index] = ['checkbox',-1];
				let column = ['','col_1','col_2','col_3'];
				if(data.type == 'radio'){
					type = 'radio';
					index = data.index >= 0 ? data.index : -1;
				}
				this.column = (data.column in column) ? column[data.column] : '';
				this.type = type;
				this.index = index;
				this.list = data.list;
				this.refz = data.ref
				this.titleSelfData = data.title
				this.optionBd = data.optionBox
				if(data.maxSize > 0 && data.maxFn){
					this.maxSize = data.maxSize;
					this.maxFn = data.maxFn;					
				}else{
					this.maxSize = undefined;
					this.maxFn = undefined;
				}
			},
			/* 获取值 */
			get(val,bole){
				/* 单选框 */
				if(this.type=='radio'){
					if(this.index >= 0){
						return {texts:this.list[this.index],data:this.optionBd,index:this.index};
					}else{
						return null;
					}
				}
				let arr=[];
				this.list.forEach((item,index)=>{
					if(item.checked == true){
						arr.push(item);
					}
				});
				if(!this.list[val].checked&&!bole){
					return {state:false,text:this.list[val]}
				}else{
					if(this.optionBd&&this.optionBd[val]&&this.list&&this.list[val]&&arr){
						let optionDataIndex = []
						for(let i in this.optionBd){
							if(this.optionBd[i].parent == this.list[val].text){
								optionDataIndex=  this.optionBd[i]
							}
						}
						return {arr:arr,option:optionDataIndex,present:this.list[val],ref:this.refz,checkIndex:val,state:true,bole:bole}
					}else{
						return {present:this.list[val],ref:this.refz,checkIndex:val,state:true}
					}
				}
				
			},
			/* 全部选中 */
			checkAll(){
				if(this.type=='radio'){
					return null;
				}
				this.list.forEach((item,index)=>{
					this.$set(this.list[index],"checked",true);
				})
			},
			/* 取消全部选中 */
			cancelAll(){
				if(this.type=='radio'){
					this.index = -1;
					return null;
				}
				this.list.forEach((item,index)=>{
					this.$set(this.list[index],"checked",false);
				})
			},
			/* 反选全部 */
			invertAll(){
				if(this.type=='radio'){
					this.index = -1;
					return null;
				}
				this.list.forEach((item,index)=>{
					this.$set(this.list[index],"checked",item.checked ? false : true);
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
.container{
	// display: flex;
	// align-items: center;
	.titleself{
		font-size: 30upx;
		font-weight: bold;
		flex-shrink: 0;
	}
	.allbox{
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: flex-start;
		align-items: flex-start;
		align-content: flex-start;
		margin-right: -20rpx;
		font-size: 28rpx;
		text-align: center;
		.box{
			margin: 0 5upx 5upx 0;
		}
	}
	
	&>view{
		margin-bottom: 20rpx;
		padding-right: 20rpx;
		box-sizing: border-box;
	}
	
	&.col_1{
		&>view{
			width: 100%;
		}
	}
	&.col_2{
		&>view{
			width: 50%;
		}
	}
	&.col_3{
		&>view{
			// width: 33.3333333%;
		}
	}
	
	.item{
		line-height: 68rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
		border: #e5e5e5 solid 1px;
		background-color: #fff;
		color: #333;
		position: relative;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		
		&.active{
			background-color: #f5fff9;
			color: #42b983;
			border: #42b983 solid 1px;
			
			&::before{
				content: '';
				display:block;
				width: 20px;
				height: 20px;
				background-color: #42b983;
				position: absolute;
				right: -1px;
				bottom: -1px;
				z-index: 1;
				clip-path: polygon(100% 0, 0% 100%, 100% 100%);
			}
			&::after{
				content: '';
				display:block;
				width: 4px;
				height: 8px;
				border-right: #fff solid 2px;
				border-bottom: #fff solid 2px;
				transform:rotate(25deg);
				position: absolute;
				right: 2px;
				bottom: 3px;
				z-index: 2;
			}
		}
	}
}
</style>
