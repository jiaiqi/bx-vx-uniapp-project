<template>
	<view>
		<web-view :src="src"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				src:'https://vhsagj.smartapps.baidu.com/pages/lemma/lemma?lemmaTitle=%E8%85%BA%E5%98%8C%E5%91%A4%E6%A0%B8%E8%8B%B7%E4%B8%89%E7%A3%B7%E9%85%B8'
			}
		},
		methods: {
			
		},
		onLoad(option) {
			if(option.pageUrl){
				this.src = decodeURIComponent(option.pageUrl)
			}
		}
	}
</script>

<style>

</style>
