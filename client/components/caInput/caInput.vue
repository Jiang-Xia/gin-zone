<template>
    <t-input t-class="ca-input" align="right" :type="type" :placeholder="!readonly?placeholder:''" :readonly="readonly"
        :disabled="disabled" :maxlength="maxlength" :borderless="borderless" :value="innerValue" @change="change" @blur="blur">
        <template #label>
            <view :class="required?'sr-required':''">
                {{label}}
            </view>
        </template>
        <template #suffix>
            <view>
                <slot></slot>
            </view>
        </template>
    </t-input>
</template>

<script>
    // import dicts from '@/common/dicts';
    export default {
        name: "caInput",
        props: {
            label: {
                type: String,
                default: ''
            },
            borderless: {
            	type: Boolean,
            	default: false
            },
            required: {
            	type: Boolean,
            	default: false
            },
            type: {
                type: String,
                default: ''
            },
            value: {
                type: String,
                default: ''
            },
            maxlength: {
                type: Number,
                default: -1
            },
            placeholder: {
                type: String,
                default: '请输入'
            },
            readonly: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {};
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
            }
        },
        methods: {
            change(e) {
                this.innerValue = e.value
                this.$emit('change', this.innerValue)
                // console.log('change',this.innerValue)
            },
            blur() {
                this.$emit('blur', this.innerValue)
                // console.log('blur',this.innerValue)
            }
        }
    }
</script>

<style lang="scss" scoped>
::v-deep .ca-input{
}
</style>

