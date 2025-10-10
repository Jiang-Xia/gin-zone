<template>
    <view class="fen-qi">
        <view class="fen-qi-item" v-for="(item2, index2) in fenqiList" :key="item2.value"
            @click="clickFenQi(item2.value)" :class="item2.value === currentFQ?'active':''">
            <view class="column-1">
                ¥{{item2.amount}}起X{{item2.label}}
            </view>
            <view class="column-2">
                含利息¥{{item2.rate}}起/期
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        name: "fq-pay",
        props: {
            value: {
                default: 3,
                type: Number
            },
            amount: {
                default: 0,
                type: Number
            },
        },
        data() {
            return {};
        },
        computed: {
            currentFQ: {
                get() {
                    return this.value
                },
                set(val) {
                    // console.log(val, '-----')
                    this.$emit('input', val)
                }
            },
            fenqiList() {
                let list = [{
                    value: 3,
                    label: '3期',
                    fee: 0.023,
                    amount: 0,
                    rate: 0,
                }, {
                    value: 6,
                    label: '6期',
                    fee: 0.045,
                    amount: 0,
                    rate: 0,
                }, {
                    value: 12,
                    label: '12期',
                    fee: 0.075,
                    amount: 0,
                    rate: 0,
                }]
                list = list.map(v => {
                    // 每次本金
                    const benji = this.amount / v.value
                    const rate = this.amount * v.fee/v.value
                    v.amount = (benji + rate).toFixed(2)
                    v.rate = rate.toFixed(2)
                    return v
                })
                return list
            }
        },
        methods: {
            clickFenQi(value) {
                this.currentFQ = value
            },
        }
    }
</script>

<style lang="scss" scoped>
    .fen-qi {
        margin-top: 20rpx;
        display: flex;
        justify-content: space-between;
        height: 88rpx;

        .fen-qi-item {
            border-radius: 12rpx;
            border: 1px solid #f1f1f1;
            width: 32%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            flex-direction: column;
            line-height: 1.2;
            padding: 4rpx 0;
            .column-1 {
                font-size: 20rpx;
            }

            .column-2 {
                font-size: 18rpx;
                color: #999;
            }
        }

        .active {
            border-color: $uni-color-primary;
        }
    }
</style>