<template>
    <view ref="confirm" class="emoji-list">
        <view class="emoji-list__content" v-show="bool">
            <z-paging ref="paging" use-virtual-list :force-close-inner-list="true"
                style="height: 300rpx;position: absolute; bottom: 0; top: inherit;" :cell-height-mode="'fixed'"
                @virtualListChange="virtualListChange" :preload-page="12" @query="queryList">
                <view class="emoji-item-wrap" v-for="(item,index) in virtualList"  :id="`zp-id-${item.zp_index}`" :key="item.zp_index">
                    <view class="emoji-item" v-for="(item2,index2) in item.data" @click="onClick(item2.key)" :title="item2.title">
                        {{item2.key}}
                    </view>
                </view>
            </z-paging>
        </view>
        <button @click="bool = !bool">11111</button>
    </view>
</template>

<script>
    import emojiJson from './emoji-en-US.json'
    let timer = null
    export default {
        name: 'EmojiList',
        props: {},
        data() {
            return {
                scrollTop: 0,
                confirm: null,
                emojiJson: {},
                emojiHtml: '',
                emojiJsonList: [],
                virtualList: [],
                bool: false
            }
        },
        watch: {},
        computed: {

        },
        async created() {
            this.renderEmoji(emojiJson)
        },
        methods: {
            renderEmoji(json) {
                let list = []
                for (let key in json) {
                    list.push({
                        key: key,
                        title: json[key]
                    })
                }
                list = this.groupArray(list, 8)
                // console.log('表情个数', emojiJsonList.length)
                console.log('emojiJsonList', list)
                this.emojiJsonList = list
            },
            groupArray(arr, groupSize = 2) {
                const result = [];
                for (let i = 0; i < arr.length; i += groupSize) {
                    const chunk = arr.slice(i, i + groupSize);
                    result.push({
                        data: chunk
                    });
                }

                return result;
            },
            virtualListChange(vList) {
                console.log('vList', vList)
            	this.virtualList = vList;
            },
            queryList(pageNo, pageSize) {
                setTimeout(()=>{
                    this.$refs.paging.setLocalPaging(this.emojiJsonList);
                    this.bool = true
                },200)
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
            }
        }
    }
</script>

<style lang="scss">
    .emoji-list {
        height: 300rpx;
        width: 100%;
        .emoji-list__content {
            height: 100%;
            width: 100%;
        }


        .emojifont {
            font-family: emojifont !important;
            font-style: normal;
            font-size: 70rpx;
            padding: 8rpx;
        }

        .emoji-item-wrap {
            .emoji-item {
                display: inline-block;
                font-size: 60rpx;
                line-height: 60rpx;
                padding: 12rpx 0;
            }
        }
    }
</style>