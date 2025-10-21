<template>
    <view ref="confirm" class="emoji-list">
        <view class="emoji-list__content">
            <z-paging ref="paging" use-virtual-list :force-close-inner-list="true" v-model="dataList"
                :cell-height-mode="'fixed'" @virtualListChange="virtualListChange" :preload-page="12" height="156px"
                :paging-style="{
                    top: 'inherit',
                }"
                @query="queryList">
                <view class="emoji-item-wrap" v-for="(item,index) in dataList" :id="`zp-id-${item.zp_index}`"
                    :key="item.zp_index">
                    <view class="emoji-item" v-for="(item2,index2) in item.data" @click="onClick(item2.key)"
                        :title="item2.title" :key="item2.data">
                        {{item2.key}}
                    </view>
                </view>
            </z-paging>
        </view>
    </view>
</template>

<script>
    import emojiJson from './emoji-en-US.json'
    let timer = null
    export default {
        name: 'EmojiList',
        props: {
            height: {
                type: String,
                default: '0px'
            }
        },
        data() {
            return {
                scrollTop: 0,
                emojiJson: {},
                emojiHtml: '',
                emojiJsonList: [],
                virtualList: [], // 使用虚拟列表渲染有问题
                dataList: []
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
                // console.log('emojiJsonList', list)
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
                // console.log('vList', vList)
                this.virtualList = vList;
            },
            queryList(pageNo, pageSize) {
                setTimeout(() => {
                    this.$refs.paging.setLocalPaging(this.emojiJsonList);
                    // this.$refs.paging.complete(this.emojiJsonList);
                }, 200)
            },
            onClick(e) {
                this.$emit('confirm', e)
            },
        }
    }
</script>

<style lang="scss">
    .emoji-list {
        height: 156px;
        width: 100%;
        overflow: hidden;
        .emoji-list__content {
            height: 100%;
            width: 100%;
        }

        .emoji-item-wrap {
            display: flex;
            justify-content: space-around;
            .emoji-item {
                display: inline-block;
                font-size: 60rpx;
                line-height: 60rpx;
                // padding: 12rpx 0;
                margin-left: 8rpx;
                margin-top: 8rpx;
            }
        }
    }
</style>