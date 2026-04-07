<template>
	<view class="ca-date-time-picker">
		<t-cell :title="label" hover :note="innerValue || placeholder" :arrow="arrow" @tap="visible = true" :required="required">
			<t-button v-if="longDate" slot="note" variant="text" theme="primary" size="extra-small" @click="setDate"
				style="margin: 0;">长期</t-button>
		</t-cell>
		<t-date-time-picker :title="label" :visible="visible" :mode="mode" :value="innerValue" :format="format"
			@change="onPickerChange" @cancel="close" @close="close" start="1970-01-01" end="2199-01-01" />
	</view>
</template>

<script>
	// import dicts from '@/common/dicts';
	export default {
		name: "caDatePicker",
		props: {
			label: {
				type: String,
				default: '日期'
			},
            required: {
				type: Boolean,
				default: false
			},
			value: {
				type: [String, Number, Array],
				default: ''
			},
			mode: {
				type: String,
				default: 'date'
			},
			placeholder: {
				type: String,
				default: '请选择时间'
			},
			format: {
				type: String,
				default: 'YYYY-MM-DD'
			},
			disabled: {
				type: Boolean,
				default: false,
			},
			longDate: {
				type: Boolean,
				default: false,
			},
			arrow: {
				type: Boolean,
				default: true,
			}
		},
		data() {
			return {
				visible: false,
			};
		},
		computed: {
			innerValue: {
				get() {
					// console.log('----> this.value', this.value)
					return this.value
				},
				set(value) {
					// console.log('----> input value', value)
                    this.$emit('update:value', value)
				}
			},
		},
		methods: {
			close() {
				this.visible = false
			},
			onPickerChange(e) {
				this.innerValue = e.value
				this.visible = false

			},
			setDate() {
				this.innerValue = '2199-01-01'
				// this.innerValue = '长期'
			}
		}
	}
</script>

<style lang="scss">

</style>

