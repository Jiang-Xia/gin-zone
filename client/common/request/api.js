import {
    sm2,
    sm3,
    sm4
} from 'sm-crypto'

const env = process.env.NODE_ENV;
// 后台加密公钥
const publicKey =
    '04d6c60496e5d6231de536259e8d6abdb28b6c3e3621108856abc07feb9a742a43bfd6ed7f4b485dcccc7a52e59eba85f7315c11d62abddaef42721d79218fa3d0'
// 前端解密私钥
const privateKey = '6e5779ba88066b86012bc54331caf9ca8b685b00da94b1b660ac8b2508d0614d'
const sm4Key = '0123456789abcdeffedcba9876543210'

let openCrypto = false
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
    // fileUrl = "http://127.0.0.1:9600"
    // baseUrl = "http://127.0.0.1:9600/api/v1"
    // wsUrl = "ws://127.0.0.1:9600/api/v1"

    // fileUrl = "http://192.168.1.51:9600"
    // baseUrl = "http://192.168.1.51:9600/api/v1"
    // wsUrl = "ws://192.168.1.51:9600/api/v1"
}
// // #ifndef MP-WEIXIN
// const myEnv = process.env.MY_ENV;
// if (env === 'development') {
//     fileUrl = '/dev-api'
//     baseUrl = '/dev-api'
//     wsUrl = 'dev-ws'

//     if (myEnv === 'prod') {
//         fileUrl = '/prod-api'
//         baseUrl = '/prod-api'
//         wsUrl = 'prod-ws'
//     }
//     console.log('当前环境------------------------->', env, myEnv)
// }
// // #endif
console.log('当前配置------------------------->', {
    fileUrl,
    baseUrl,
    wsUrl,
})
// #ifdef MP-ALIPAY || MP-WEIXIN
const { miniProgram } = uni.getAccountInfoSync()
// develop trial release
console.log('小程序版本：', miniProgram.envVersion)
// #endif

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
    async restful(url, data = {}, config) {
        const defaultHeaderConfig = {
            Authorization: this.getToken()
        }

        for (let key in data) {
            if (url.indexOf(`{${key}}`) != -1) {
                url = url.replace(`{${key}}`, `${data[key]}`);
                // console.log(url)
                data[key] === undefined
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
            if (openCrypto && !url.includes('/common/signIn')) {
                url = baseUrl + url
                const id = uni.getStorageSync('zoneSessionId')
                if (id) {
                    config.header = {
                        ...config.header,
                        'Jx-Security': 'Jx-Security',
                        'Jx-SessionId': id
                    }
                }
                // 有请求体才加密
                if (['POST', 'PUT', 'PATCH'].includes(config.method)) {
                    console.log(url, '上传参数：', data)
                    let content = JSON.stringify(data)
                    const workKey = uni.getStorageSync('zoneWorkKey')
                    console.log('workKey', workKey)
                    content = sm4.encrypt(content, workKey)
                    data = {
                        content
                    }
                }
            } else {
                url = baseUrl + url
            }
        }

        // 自定义请求头
        if (config.header) {
            config.header = {
                ...config.header,
                ...defaultHeaderConfig
            }
        } else {
            config.header = defaultHeaderConfig
        }

        return {
            data,
            url,
            config
        }
    }
    // 请求响应完成
    complete(res, resolve, reject, url) {
        // 是json字符串时手动parse
        // if(typeof res.data === "string"){
        // 	res.data = JSON.parse(res.data)
        // }
        // console.log("响应数据：",res.data)
        const code = res.data && res.data.code
        if (code === 0 || code === 200) {
            if (openCrypto && !url.includes('/common/signIn')) {
                if (res.data.encrypt) {
                    try {
                        const content = res.data.encrypt
                        const workKey = uni.getStorageSync('zoneWorkKey')
                        // console.log('content ------------>', content)
                        res.data.data = sm4.decrypt(content, workKey)
                        res.data.data = JSON.parse(res.data.data)
                        console.log(url, '响应参数：', res.data.data)
                    } catch (error) {
                        console.error('解密报文失败', error)
                    }
                }

            }
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
            if (res.data.data?.reload) {
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
        return new Promise(async (resolve, reject) => {
            const rest = await this.restful(url, data, config)
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
        return new Promise(async (resolve, reject) => {
            const rest = await this.restful(url, data, {
                ...config,
                method: "POST"
            })
            // console.log(rest.config.header)
            uni.request({
                url: rest.url,
                data: rest.data,
                method: rest.config.method,
                header: rest.config.header,
                complete: (res) => {
                    this.complete(res, resolve, reject, url)
                }
            });
        })
    }
    get(url, data, config = {}) {
        return new Promise(async (resolve, reject) => {
            const rest = await this.restful(url, data, {
                ...config,
                method: "GET"
            })
            uni.request({
                url: rest.url,
                data: rest.data,
                method: rest.config.method,
                header: rest.config.header,
                complete: (res) => {
                    this.complete(res, resolve, reject, url)
                }
            });
        })
    }
    patch(url, data, config = {}) {
        return new Promise(async (resolve, reject) => {
            const rest = await this.restful(url, data, {
                ...config,
                method: "PATCH"
            })
            uni.request({
                url: rest.url,
                data: rest.data,
                method: rest.config.method,
                header: rest.config.header,
                complete: (res) => {
                    this.complete(res, resolve, reject, url)
                }
            });
        })
    }
    put(url, data, config = {}) {
        return new Promise(async (resolve, reject) => {
            const rest = await this.restful(url, data, {
                ...config,
                method: "PUT"
            })
            uni.request({
                url: rest.url,
                data: rest.data,
                method: rest.config.method,
                header: rest.config.header,
                complete: (res) => {
                    this.complete(res, resolve, reject, url)
                }
            });
        })
    }
    del(url, data, config = {}) {
        return new Promise(async (resolve, reject) => {
            const rest = await this.restful(url, data, {
                ...config,
                method: "DELETE"
            })
            console.log('del---', rest)
            uni.request({
                url: rest.url,
                data: rest.data,
                method: rest.config.method,
                header: rest.config.header,
                complete: (res) => {
                    this.complete(res, resolve, reject, url)
                }
            });
        })
    }

    upload(filePath) {
        return new Promise(async (resolve, reject) => {
            uni.uploadFile({
                url: baseUrl + '/base/upload',
                filePath: filePath,
                name: "file",
                header: {
                    Authorization: this.getToken()
                },
                complete: (res) => {
                    if (res.data) {
                        res.data = JSON.parse(res.data)
                    }
                    this.complete(res, resolve, reject, '/base/upload')
                }
            });
        })
    }

    // 统一签到
    signIn() {
        if (openCrypto) {
            return this.post('/common/signIn', {
                sence: 'blog'
            }).then(res => {
                if (res.data) {
                    res.data = res.data.slice(2, res.data.length)
                    // console.log('en ----------->', res.data)
                    res.data = sm2.doDecrypt(res.data, privateKey, 1)
                    res.data = JSON.parse(res.data)
                    console.log('de ----------->', res.data)
                    uni.setStorageSync('zoneSessionId', res.data.sessionId)
                    uni.setStorageSync('zoneWorkKey', res.data.workKey)
                }
            }).catch(err => {
                uni.setStorageSync('zoneSessionId', '')
                uni.setStorageSync('zoneWorkKey', '')
            })
        } else {
            return Promise.resolve()
        }

    }
}

const api = new Api()
export default api