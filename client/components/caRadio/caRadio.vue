<template>
    <t-cell :title="label" :required="required">
        <template #note>
            <view class="ca-radio-group">
                <t-radio-group :custom-style="boxCustomStyle" v-model="innerValue" variant="primary-filled"
                    @change="change" :default-value="groupDefaultValue" borderless>
                    <t-radio v-for="(item,index) in options" :key="item.value"
                        :value="item.value">{{ item.label }}</t-radio>
                </t-radio-group>
            </view>
        </template>
    </t-cell>

</template>

<script>
    export default {
        name: "caRadio",
        props: {
            label: {
                type: String,
                default: ''
            },
            defaultValue: {
                type: [String, Number],
                default: ''
            },
            required: {
                type: Boolean,
                default: false
            },
            value: {
                type: [String, Number],
                default: ''
            },
            options: {
                require: true,
                type: Array,
                default: () => []
            },
        },
        data() {
            return {};
        },
        computed: {
            innerValue: {
                get() {
                    return this.value
                },
                set(value) {
                    // console.log('----> input value', value)
                    this.$emit('update:value', value)
                }
            },
            boxCustomStyle() {
                return {
                    padding: '0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    // backgroundColor: 'var(--td-bg-color-container, #fff)',
                };
            },
            groupDefaultValue() {
                // t-radio-group 的 default-value 可能会影响回显。
                // 优先使用外部传入的 defaultValue；没传时使用当前 v-model 值作为默认值。
                return this.defaultValue !== '' ? this.defaultValue : this.value
            }
        },
        methods: {
            change(e) {
                // 兼容 t-radio-group 在不同端/版本的回调结构（e.value / e.detail.value）
                const nextValue = e?.detail?.value ?? e?.value
                this.innerValue = nextValue
                this.$emit('change', this.innerValue)
                // console.log('change',this.innerValue)
            },
        }
    }
</script>

<style lang="scss" scoped>
    
</style>

