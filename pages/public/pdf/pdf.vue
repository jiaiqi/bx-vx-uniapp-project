<template>
	<view>
		<view>{{name}}</view>
		<web-view :src="pdfUrl"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				pdfUrl:'',
				name:""
			}
		},
		onLoad(options) {
			
			if(options.hasOwnProperty('name')){
				this.name = options.name
				
			}
			let url = "";
			    // #ifdef H5
			    url = "/file";
			    // #endif
			    // #ifndef H5
			    url = this.file_url;
			    // #endif
			    // console.log(`${fileurl}${options.fileurl}`);
			    this.pdfUrl = "/hybrid/html/web/viewer.html?url=" + encodeURIComponent(`${options.fileurl}`+ '&bx_auth_ticket=' +uni.getStorageSync('bx_auth_ticket'));
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
