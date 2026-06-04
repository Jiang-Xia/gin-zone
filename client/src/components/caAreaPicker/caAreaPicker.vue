<template>
	<view class="ca-area-picker">
		<t-cell :title="label" arrow hover :note="displayText || placeholder" @click="showClick" :required="required" />

		<t-picker
			@close="close"
			@cancel="close"
			@pick="onPick"
			@confirm="onConfirm"
			@change="onPickerChange"
			:visible="visible && !disabled"
			:value="innerValueArr"
			data-key="value"
			:title="label"
			cancelBtn="取消"
			confirmBtn="确认"
			:disabled="disabled"
		>
			<t-picker-item :options="provinceOptions"></t-picker-item>
			<t-picker-item v-if="level >= 2" :options="cityOptions"></t-picker-item>
			<t-picker-item v-if="level >= 3" :options="districtOptions"></t-picker-item>
		</t-picker>
	</view>
</template>

<script>
	import areaData from 'china-area-data'

	function toOptions(mapObj) {
		if (!mapObj) return []
		return Object.keys(mapObj).map((code) => ({
			value: code,
			label: mapObj[code],
		}))
	}

	function safeFirstCode(list) {
		return Array.isArray(list) && list.length ? list[0].value : ''
	}

	function moveFirst(list, predicate) {
		if (!Array.isArray(list) || !list.length) return list || []
		const idx = list.findIndex(predicate)
		if (idx <= 0) return list
		const next = list.slice()
		const [picked] = next.splice(idx, 1)
		next.unshift(picked)
		return next
	}

	export default {
		name: 'caAreaPicker',
		props: {
			required: {
				type: Boolean,
				default: false,
			},
			label: {
				type: String,
				default: '省市区',
			},
			placeholder: {
				type: String,
				default: '请选择',
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			// 选择层级：1-省；2-省市；3-省市区
			level: {
				type: Number,
				default: 3,
			},
			// v-model:value：['110000','110100','110101']
			value: {
				type: Array,
				default: () => [],
			},
			// 分隔符（展示用）
			separator: {
				type: String,
				default: '',
			},
		},
		data() {
			return {
				visible: false,
				displayText: '',
				innerValueArr: [],
			}
		},
		computed: {
			provinceOptions() {
				const list = toOptions(areaData && areaData['86'])
				// 需求：江西省排第一（360000）
				return moveFirst(list, (v) => v && (v.value === '360000' || v.label === '江西省'))
			},
			cityOptions() {
				const p = this.innerValueArr[0] || ''
				if (!p) return []
				return toOptions(areaData && areaData[p])
			},
			districtOptions() {
				const c = this.innerValueArr[1] || ''
				if (!c) return []
				return toOptions(areaData && areaData[c])
			},
		},
		watch: {
			value: {
				immediate: true,
				handler() {
					this.syncFromValue()
				},
			},
		},
		methods: {
			syncFromValue() {
				const v = Array.isArray(this.value) ? this.value : []
				// 默认值要求为空：外部未传值时，不自动回填北京市/任意值
				if (!v.length) {
					this.innerValueArr = []
					this.displayText = ''
					return
				}

				const provinceCode = v[0] || ''
				if (!provinceCode) {
					this.innerValueArr = []
					this.displayText = ''
					return
				}

				const next = [provinceCode]
				if (this.level >= 2) {
					const cityList = toOptions(areaData && areaData[provinceCode])
					const cityCode = v[1] || safeFirstCode(cityList)
					next.push(cityCode)
				}
				if (this.level >= 3) {
					const cityCode = next[1]
					const districtList = toOptions(areaData && areaData[cityCode])
					const districtCode = v[2] || safeFirstCode(districtList)
					next.push(districtCode)
				}

				this.innerValueArr = next
				const names = this.getNamesByCodes(next)
				this.displayText = names.filter(Boolean).join(this.separator)
			},
			getNamesByCodes(codes) {
				const p = codes[0] ? (areaData['86'] ? areaData['86'][codes[0]] : '') : ''
				const c = codes[1] ? (areaData[codes[0]] ? areaData[codes[0]][codes[1]] : '') : ''
				const d = codes[2] ? (areaData[codes[1]] ? areaData[codes[1]][codes[2]] : '') : ''
				return [p, c, d]
			},
			ensureDefaultSelectionForOpen() {
				if (this.innerValueArr && this.innerValueArr.length) return

				const provinceCode = safeFirstCode(this.provinceOptions)
				if (!provinceCode) return

				if (this.level === 1) {
					this.innerValueArr = [provinceCode]
					return
				}

				const cityList = toOptions(areaData && areaData[provinceCode])
				const cityCode = safeFirstCode(cityList)
				if (this.level === 2) {
					this.innerValueArr = [provinceCode, cityCode]
					return
				}

				const districtList = toOptions(areaData && areaData[cityCode])
				const districtCode = safeFirstCode(districtList)
				this.innerValueArr = [provinceCode, cityCode, districtCode]
			},
			showClick() {
				if (this.disabled) return
				// 打开时再初始化默认定位（不影响默认展示为空）
				this.ensureDefaultSelectionForOpen()
				this.visible = true
			},
			close() {
				this.visible = false
			},
			onPick(e) {
				// 列变化时联动更新后续列（t-picker 的 change 只在确认时触发）
				const column = (e && typeof e.column === 'number') ? e.column : -1
				const codes = (e && e.value) ? e.value : []

				const provinceCode = codes[0] || safeFirstCode(this.provinceOptions)
				const cityList = toOptions(areaData && areaData[provinceCode])
				const safeCityCode = safeFirstCode(cityList)

				if (this.level === 1) {
					this.innerValueArr = [provinceCode]
					return
				}

				if (column === 0) {
					const cityCode = safeCityCode
					if (this.level === 2) {
						this.innerValueArr = [provinceCode, cityCode]
						return
					}
					const districtList = toOptions(areaData && areaData[cityCode])
					const districtCode = safeFirstCode(districtList)
					this.innerValueArr = [provinceCode, cityCode, districtCode]
					return
				}

				const cityCode = codes[1] || safeCityCode
				if (this.level === 2) {
					this.innerValueArr = [provinceCode, cityCode]
					return
				}

				if (column === 1) {
					const districtList = toOptions(areaData && areaData[cityCode])
					const districtCode = safeFirstCode(districtList)
					this.innerValueArr = [provinceCode, cityCode, districtCode]
					return
				}

				const districtCode = codes[2] || safeFirstCode(toOptions(areaData && areaData[cityCode]))
				this.innerValueArr = [provinceCode, cityCode, districtCode]
			},
			onPickerChange(e) {
				// t-picker 的 change 仅在“确认且值变化”时触发，这里保留兼容，但不再依赖它做提交
				this.applySelection(e)
			},
			onConfirm(e) {
				this.applySelection(e, true)
			},
			applySelection(e, closeAfter = false) {
				const codes = (e && e.value) ? e.value : []
				const names = (e && e.label) ? e.label : this.getNamesByCodes(codes)

				const fixedCodes = codes.slice(0, this.level)
				const fixedNames = names.slice(0, this.level)

				this.innerValueArr = fixedCodes
				this.displayText = fixedNames.filter(Boolean).join(this.separator)
				if (closeAfter) this.visible = false

				this.$emit('update:value', fixedCodes)
				this.$emit('change', {
					codes: fixedCodes,
					names: fixedNames,
					text: this.displayText,
				})
			},
		},
	}
</script>

<style lang="scss">
</style>

