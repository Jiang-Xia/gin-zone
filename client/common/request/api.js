const env = process.env.NODE_ENV;
let fileUrl = ""
let baseUrl = ""
let wsUrl = ""
if (env === 'production') {
	fileUrl = "https://jiang-xia.top/x-zone/api/v1"
	baseUrl = "https://jiang-xia.top/x-zone/api/v1"
	wsUrl = "wss://jiang-xia.top/x-zone/api/v1"
	/* ubuntu 服务器 */
	// fileUrl = "http://43.139.16.164/x-zone/api/v1"
	// baseUrl = "http://43.139.16.164/x-zone/api/v1"
	// wsUrl = "wss://43.139.16.164/x-zone/api/v1"
} else {
	fileUrl = "https://jiang-xia.top/x-zone/api/v1"
	baseUrl = "https://jiang-xia.top/x-zone/api/v1"
	wsUrl = "wss://jiang-xia.top/x-zone/api/v1"
	
	/* 本地 */
	// fileUrl = "http://localhost:9600"
	// baseUrl = "http://localhost:9600/api/v1"
	// wsUrl = "ws://localhost:9600/api/v1"
	
	// fileUrl = "http://192.168.1.51:9600"
	// baseUrl = "http://192.168.1.51:9600/api/v1"
	// wsUrl = "ws://192.168.1.51:9600/api/v1"
}

export {
	fileUrl,
	baseUrl,
	wsUrl
}

export class Api {
	// 获取token
	getToken() {
		let token = uni.getStorageSync("zoneToken")
		// console.log("zoneToken",token)
		return token
	}
	// 转化rest风格api
	restful(url, data = {}, config) {
		for (let key in data) {
			if (url.indexOf(`{${key}}`) != -1) {
				url = url.replace(`{${key}}`, `${data[key]}`);
				// console.log(url)
				data[key]===undefined
			}
		}

		if (Object.keys(data).length === 0) {
			data = undefined // 置undefined不传空对象
		}
		// 自定义baseUrl
		if (config.baseUrl) {
			url = config.baseUrl + url
		} else if (url.indexOf("http") !== -1) {
			// 全url
			url = url
		} else {
			url = baseUrl + url
		}
		// 自定义请求头
		if (!config.header) {
			config.header = {
				Authorization: this.getToken()
			}
		} 
		return {
			data,
			url,
			config
		}
	}
	// 请求响应完成
	complete(res, resolve, reject) {
		// 是json字符串时手动parse
		// if(typeof res.data === "string"){
		// 	res.data = JSON.parse(res.data)
		// }
		// console.log("响应数据：",res.data)
		const code = res.data && res.data.code
		if (code === 0 || code === 200) {
			resolve(res.data)
		} else if (!res.data) {
			reject(res.data)
			uni.showToast({
				title: "网络错误",
				icon: "error"
			});
		} else {
			reject(res.data)
			const msg = res.data && res.data.msg
			// 鉴权失败清空信息
			if(res.data.data?.reload){
				uni.setStorageSync("zoneToken", "")
				uni.setStorageSync('zoneUserInfo', "")
			}
			uni.showToast({
				title: msg,
				icon: "none"
			});
		}
	}
	// 综合请求方法
	request(url, method = "GET", data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
			uni.request({
				url: rest.url,
				data: rest.data,
				method,
				header: rest.config.header,
				complete: (res) => {
					resolve(res)
				}
			});
		})
	}
	post(url, data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
			// console.log(rest.config.header)
			uni.request({
				url: rest.url,
				data: rest.data,
				method: "POST",
				header: rest.config.header,
				complete: (res) => {
					this.complete(res, resolve, reject)
				}
			});
		})
	}
	get(url, data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
			uni.request({
				url: rest.url,
				data: rest.data,
				method: "GET",
				header: rest.config.header,
				complete: (res) => {
					this.complete(res, resolve, reject)
				}
			});
		})
	}
	patch(url, data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
			uni.request({
				url: rest.url,
				data: rest.data,
				method: "PATCH",
				header: rest.config.header,
				complete: (res) => {
					this.complete(res, resolve, reject)
				}
			});
		})
	}
	put(url, data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
			uni.request({
				url: rest.url,
				data: rest.data,
				method: "PUT",
				header: config.header,
				complete: (res) => {
					this.complete(res, resolve, reject)
				}
			});
		})
	}
	del(url, data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
			uni.request({
				url: rest.url,
				data: rest.data,
				method: "DELETE",
				header: config.header,
				complete: (res) => {
					this.complete(res, resolve, reject)
				}
			});
		})
	}

	upload(filePath) {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: baseUrl + '/base/upload',
				filePath: filePath,
				name: "file",
				header: {
					Authorization: this.getToken()
				},
				complete: (res) => {
					if(res.data){
						res.data = JSON.parse(res.data)
					}
					this.complete(res, resolve, reject)
				}
			});
		})
	}
}

const api = new Api()
export default api
