//根据当前时间获取昨天，前天
function getYesterday(detail, num) {
    var today = new Date();
    if (detail) {
        today = new Date(detail);
    }
    var nowTime = today.getTime();
    var ms = 24 * 3600 * 1000 * num;
    today.setTime(parseInt(nowTime + ms));
    var oYear = today.getFullYear();
    var oMoth = (today.getMonth() + 1).toString();
    if (oMoth.length <= 1) oMoth = '0' + oMoth;
    var oDay = today.getDate().toString();
    if (oDay.length <= 1) oDay = '0' + oDay;
    return oYear + "" + oMoth + "" + oDay;
}
// 前端生成随机数GUID
function guid(loop) {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    var g = "";
    for (var i = 0; i < loop; i++) {
        g = g + S4();
    }
    return g;
}
// 判断是微信还是支付宝环境
function isWxOrAli() {
    const ua = navigator.userAgent.toLowerCase();
    let payType = ''
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        uni.setStorageSync('user_agent', 'WXPAY');
        payType = 'WXPAY'
    } else if (ua.match(/AlipayClient/i) == 'alipayclient') {
        uni.setStorageSync('user_agent', 'ALIPAY');
        payType = 'ALIPAY'
    }
    return payType
}
// 微信和支付宝 h5支付关闭当前页面
function closeWindow() {
    const payType = isWxOrAli()
    console.log('关闭h5', payType)
    if (payType === 'WXPAY') {
        document.addEventListener('WeixinJSBridgeReady', function() {
            WeixinJSBridge.call('closeWindow');
        }, false);
        WeixinJSBridge.call('closeWindow');
    } else if (payType === 'ALIPAY') {
        document.addEventListener('AlipayJSBridgeReady', function() {
            AlipayJSBridge.call('closeWebview');
        }, false);
        AlipayJSBridge.call('closeWebview');
    }
    window.close()
}
// 脱敏银行卡号
function getAcctNoDescAllQHTwo(acctNo) {

    if (acctNo.length < 4) {
        return acctNo;
    }
    return acctNo.substring(0, 4) + ' ' + '**** ****' + ' ' + acctNo.substring(acctNo.length - 4, acctNo.length);
}
// 金额格式化
function moneyFormatter2(num) {
    if (!num) {
        return "0.00";
    }
    var num = num + '';
    var d = '';
    if (num.slice(0, 1) == '-') {
        d = num.slice(0, 1);
        num = num.slice(1);
    }
    var len = num.length;
    var index = num.indexOf('.');
    if (index == -1) {
        num = num + '.00';
    } else if ((index + 2) == len) {
        num = num + '0';
    }
    var index = num.indexOf('.'); // 字符出现的位置
    var num2 = num.slice(-3);
    num = num.slice(0, index)
    var result = '';
    while (num.length > 3) {
        result = ',' + num.slice(-3) + result;
        num = num.slice(0, num.length - 3);
    }
    if (num) {
        result = num + result;
    }
    return d + (result + num2);
}
// 获取url参数
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}

const request = (url, ) => {
    return new Promise((resolve, reject) => {
        uni.request({
            url,
            success(res) {
                resolve(res.data)
            },
            fail() {
                reject(res)
            }
        })
    })
}
// 请求方法,根据实际业务封装, 这里模拟请求数据
function Post(url, params, bool, cb) {
    console.log(url + ' 接口请求参数------>', params)
    const jsonUrl = `./static/data/json/pay/${url}.json`
    return request(jsonUrl).then( res => {
        setTimeout(() => {
            cb(res)
        }, 100)
    })
}
export default {
    Post,
    getYesterday,
    guid,
    isWxOrAli,
    closeWindow,
    getAcctNoDescAllQHTwo,
    moneyFormatter2,
    getQueryVariable
}