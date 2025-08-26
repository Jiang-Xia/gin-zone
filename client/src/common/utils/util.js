import {
	color
} from "./enum";

export const formatTime = (date, sign = "/") => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return (
		[year, month, day].map(formatNumber).join(sign) +
		' ' + [hour, minute, second].map(formatNumber).join(':')
	)
}


const formatNumber = (n) => {
	const s = n.toString()
	return s[1] ? s : '0' + s
}


export const getRandomColor = () => {
	return color[Math.round(Math.random() * color.length)]
}


//  rgb转为十六进制
export const colorHex = function(color) {
	// 十六进制颜色值的正则表达式
	const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
	// 如果是rgb颜色表示
	if (/^(rgb|RGB)/.test(color)) {
		const aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
		let strHex = '#'
		for (let i = 0; i < aColor.length; i++) {
			let hex = Number(aColor[i]).toString(16)
			if (hex.length < 2) {
				hex = '0' + hex
			}
			strHex += hex
		}
		if (strHex.length !== 7) {
			strHex = color
		}
		return strHex
	} else if (reg.test(color)) {
		const aNum = color.replace(/#/, '').split('')
		if (aNum.length === 6) {
			return color
		} else if (aNum.length === 3) {
			let numHex = '#'
			for (let i = 0; i < aNum.length; i += 1) {
				numHex += aNum[i] + aNum[i]
			}
			return numHex
		}
	}
	return color
}
// 十六进制转为rgb
export const colorRgb = function(color) {
	let sColor = color.toLowerCase()
	// 十六进制颜色值的正则表达式
	const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
	// 如果是16进制颜色
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4) {
			let sColorNew = '#'
			for (let i = 1; i < 4; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
			}
			sColor = sColorNew
		}
		// 处理六位的颜色值
		const sColorChange = []
		for (let i = 1; i < 7; i += 2) {
			sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
		}
		return 'RGB(' + sColorChange.join(',') + ')'
	}
	return sColor
}
/**
 * 格式化日期
 * @prama t 时间戳
 * @return str MM-dd HH:mm
 */
export function formatDate(t) {
	t = t || Date.now();
	let time = new Date(t);
	let str = time.getMonth() < 9 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1;
	str += '-';
	str += time.getDate() < 10 ? '0' + time.getDate() : time.getDate();
	str += ' ';
	str += time.getHours();
	str += ':';
	str += time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes();
	return str;
};

/**
 * 距当前时间点的时长
 * @prama time 时间戳
 * @return str
 */
export function beforeTimeNow(updateTime) {
	if (updateTime === null) {
		return ''
	}
	const now = new Date().getTime()
	const second = Math.floor((now - updateTime) / 1000)
	const minute = Math.floor(second / 60)
	const hour = Math.floor(minute / 60)
	const day = Math.floor(hour / 24)
	if (day > 0) {
		let ret = day + '天前'
		if (day >= 7) {
			ret = formatDate(updateTime)
		}
		return ret
	} else if (hour > 0) {
		return hour + '小时前'
	} else if (minute > 0) {
		return minute + '分钟前'
	} else if (second > 0) {
		return second + '秒前'
	} else {
		return '刚刚'
	}
}
