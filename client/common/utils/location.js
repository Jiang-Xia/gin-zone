// 定位 + 逆地理：纯函数化，供 mixins / composable 复用

export function getCurrentAddressByLocation() {
  uni.showLoading({
    title: '加载中',
  })

  return new Promise((resolve, reject) => {
    uni.getLocation({
      geocode: true,
      accuracy: true,
      isHighAccuracy: true,
      type: 'wgs84', // 返回可用于 uni.openLocation 的经纬度
      success: (locationInfo) => {
        const { latitude, longitude } = locationInfo
        const url = 'https://restapi.amap.com/v3/geocode/regeo'
        const params = {
          // WEB 服务 api key
          key: '7279c02a8edb6f46df4fe81dbe8be1a4',
          location: longitude + ',' + latitude,
        }

        uni.request({
          url,
          data: params,
          method: 'GET',
          complete: (res) => {
            try {
              const regeocode = res.data.regeocode
              const formattedAddress = regeocode.formatted_address
              resolve({
                locationInfo,
                formattedAddress,
              })
            } catch (e) {
              reject(e)
            } finally {
              uni.hideLoading()
            }
          },
        })
      },
      fail: (err) => {
        uni.hideLoading()
        reject(err)
      },
      complete: () => {
        // 兜底：避免某些端调用未触发 success 时 loading 卡住
        setTimeout(() => {
          try {
            uni.hideLoading()
          } catch (e) {}
        }, 2000)
      },
    })
  })
}

