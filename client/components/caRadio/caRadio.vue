<template>
    <t-cell :title="label" :required="required">
        <template #note>
            <view class="ca-radio-group">
                <t-radio-group :custom-style="boxCustomStyle" v-model="innerValue" variant="primary-filled"
                    @change="change" :default-value="defaultValue" borderless>
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
                type: String,
                default: ''
            },
            required: {
                type: Boolean,
                default: false
            },
            value: {
                type: String,
                default: ''
            },
            options: {
                require: true,
                type: Array,
                default: []
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
        },
        methods: {
            change(e) {
                this.innerValue = e.value
                this.$emit('change', this.innerValue)
                // console.log('change',this.innerValue)
            },
        }
    }
</script>

<style lang="scss" scoped>
    
</style>

