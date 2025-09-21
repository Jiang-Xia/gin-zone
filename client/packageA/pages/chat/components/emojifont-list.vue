<template>
    <view ref="confirm" class="emoji-list">
        <view class="emoji-list__content">
            <scroll-view :scroll-top="scrollTop" :scroll-y="true" :show-scrollbar="true">
                <view class="scroll-content">
                   <view class="emoji-item-wrap" v-for="(value, key) in emojiJson" :title="emojiJson[key]" :key="emojiJson[key]" @click="onClick(key)">
                        <view class="emoji-item">{{key}}</view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script>
    import emojis from './emojis.js';
    import emojiJson from './emoji-en-US.json'
    let timer = null
    export default {
        name: 'EmojiList',
        props: {},
        data() {
            return {
                scrollTop: 0,
                confirm: null,
                emojis: emojis,
                emojiJson: {},
                emojiHtml: ''
            }
        },
        watch: {},
        computed: {

        },
        async created() {
            // app内部请求不了
            // uni.request({
            //     url: './static/data/emoji-en-US.json',
            //     complete: (res) => {
            //         this.renderEmoji(res.data)
            //     }
            // })
            this.renderEmoji(emojiJson)
        },
        methods: {
            renderEmoji(json) {
                this.emojiJson = json
                // console.log('emojiJson', this.emojiJson)
            },
            onClick(e) {
                this.confirm(e)
            },
            open({
                confirm
            }) {
                // console.log('打开表情面板')
                // 赋值回调方法
                if (confirm) this.confirm = confirm
                this.scrollTop = 0
            },
        }
    }
</script>

<style lang="scss">
    .emoji-list {
        min-height: 300rpx;
        width: 100%;
        .emoji-list__content {
            height: 100%;
            width: 100%;
        }

        uni-scroll-view {
            height: 300rpx;
            width: 100%;
        }

        .scroll-content {
            padding-bottom: 40rpx;
            width: 100%;
        }

        .emojifont {
            font-family: emojifont !important;
            font-style: normal;
            font-size: 70rpx;
            padding: 8rpx;
        }
        .emoji-item-wrap{
            display: inline-block;
            .emoji-item{
                display: inline-block;
                font-size: 60rpx;
                line-height: 60rpx;
                padding: 12rpx 0;
            }
        }
    }
</style>