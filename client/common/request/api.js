export const baseUrl = "http://172.18.32.3:9600/api/v1"
// const baseUrl = "https://jiang-xia.top/x-zone/api/v1"
// const baseUrl = "http://localhost:9600/api/v1"
// export const baseUrl = "http://192.168.1.51:9600/api/v1"
// const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcklkIjoiODUwMzE2ODI4Mzg1MjgiLCJ1c2VyTmFtZSI6InVzZXJfMSIsImV4cCI6MTY3MjE5NjYxMywiaWF0IjoxNjcyMTUzNDEzfQ.ktrL91dhMHh8NoRubglDWVXtRWaRLiYqHo7J_5Fscjk"
// uni.setStorageSync("token",testToken)
export class Api {
	// 获取token
	getToken() {
		let token = uni.getStorageSync("token")
		// console.log("token",token)
		return token
	}
	// 转化rest风格api
	restful(url, data={}, config) {
		for (let key in data) {
			if (url.indexOf(`{${key}}`) != -1) {
				url = url.replace(`{${key}}`, `${data[key]}`);
				delete data[key]
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
		} else {
			config.header.Authorization = this.getToken()
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
			uni.showToast({
				title:msg,
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
					this.complete(res, resolve, reject)
				}
			});
		})
	}
	post(url, data, config = {}) {
		return new Promise((resolve, reject) => {
			const rest = this.restful(url, data, config)
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
				url: baseUrl+'/base/upload',
				filePath:filePath,
				name:"file",
				header: {
					Authorization: this.getToken()
				},
				complete: (res) => {
					res.data = JSON.parse(res.data)
					this.complete(res, resolve, reject)
				}
			});
		})
	}
}

const api = new Api()
export default api
