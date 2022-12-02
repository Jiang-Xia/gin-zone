const baseUrl = "http://localhost:9600/api/v1"
export class Api {
	restful(url, data) {
			url =  baseUrl + url
			for (let key in data) {
				if (url.indexOf(`{${key}}`) != -1) {
					url = url.replace(`{${key}}`, `${data[key]}`);
					delete data[key]
				}
			}
				
			if(Object.keys(data).length===0){
				data = undefined // 置undefined不传空对象
			}
			return {data,url}
		}
		complete(res, resolve, reject) {
			if (res.data.code === 0) {
				resolve(res.data)
			} else {
				reject(res.data)
				uni.showToast({title:"系统繁忙", icon:"error"});
			}
		}
		request(url, method = "GET", data,config={}) {
			return new Promise((resolve, reject) => {
				const rest =  this.restful(url,data)
				uni.request({
					url:rest.url, 
					data:rest.data,
					method,
					header: config.header,
					complete: (res) => {
						this.complete(res, resolve, reject)
					}
				});
			})
		}
		post(url, data, config={}) {
			return new Promise((resolve, reject) => {
				const rest =  this.restful(url,data)
				uni.request({
					url:rest.url, 
					data:rest.data,
					method: "POST",
					header: config.header,
					complete: (res) => {
						this.complete(res, resolve, reject)
					}
				});
			})
		}
		get(url, data, config={}) {
			return new Promise((resolve, reject) => {
				const rest =  this.restful(url,data)
				uni.request({
					url:rest.url, 
					data:rest.data,
					method: "GET",
					header: config.header,
					complete: (res) => {
						this.complete(res, resolve, reject)
					}
				});
			})
		}
		put(url, data, config={}) {
			return new Promise((resolve, reject) => {
				const rest =  this.restful(url,data)
				uni.request({
					url:rest.url, 
					data:rest.data,
					method: "PUT",
					header: config.header,
					complete: (res) => {
						this.complete(res, resolve, reject)
					}
				});
			})
		}
		del(url, data, config={}) {
			return new Promise((resolve, reject) => {
				const rest =  this.restful(url,data)
				uni.request({
					url:rest.url, 
					data:rest.data,
					method: "DELETE",
					header: config.header,
					complete: (res) => {
						this.complete(res, resolve, reject)
					}
				});
			})
		}
}

const api = new Api()
export default api
