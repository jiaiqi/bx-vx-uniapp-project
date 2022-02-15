module.exports = {
	// 关闭生产环境的source Map
	productionSourceMap:false,
	chainWebpack: (config) => {
		// 移除 prefetch 插件
		config.plugins.delete('prefetch');
		// 移除 preload 插件，避免加载多余的资源
		config.plugins.delete('preload')
		// 发行或运行时启用了压缩时会生效
		config.optimization.minimizer('terser').tap((args) => {
			const compress = args[0].terserOptions.compress
			// 非 App 平台移除 console 代码(包含所有 console 方法，如 log,debug,info...)
			compress.drop_console = true
			compress.pure_funcs = [
				'__f__', // App 平台 vue 移除日志代码
				// 'console.debug' // 可移除指定的 console 方法
			]
			return args
		})
	}
}
