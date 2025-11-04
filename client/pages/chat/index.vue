<template>
    <pageConfig title="聊天" :left="false">
        <view class="container">
            <view class="tip" v-if="!defaultList.length&&!userList.length">
                没有好友快去添加吧~
            </view>
            <uni-list :border="true" v-else>
                <!-- 默认列表 -->
                <uni-list-chat v-for="(item,index) in defaultList" :key="index" :avatar-circle="true" :title="item.name"
                    :avatar="item.avatar" :note="item.note" :time="item.time" clickable @click="clickDefaultItem(item)">
                </uni-list-chat>
                <!-- 右侧带角标 -->
                <!-- <uni-list-chat v-for="(item,index) in userList" :key="index" :avatar-circle="true" :title="item.name"
        			:avatar="item.avatar" :note="item.note" :time="item.time" :badge-text="item.noReadMsgCount" clickable
        			@click="clickUserItem(item)">
        		</uni-list-chat> -->
                <uni-swipe-action ref="swipeAction">
                    <uni-swipe-action-item :threshold="50" :right-options="options2" v-for="(item,index) in userList"
                        :key="(item.userId||item.groupId)+index" @click="(e)=>{bindClick(item,e.index)}">
                        <!-- <uni-list-chat :avatar-circle="true" :title="item.name" :avatar="item.avatar" :note="item.note"
                            :time="item.time" :badge-text="item.noReadMsgCount" clickable @click="clickUserItem(item)">
                        </uni-list-chat> -->
                        <view class="chat-item" @click="clickUserItem(item)">
                            <uv-image class="image-item" width="43" height="43" radius="50%" :src="item.avatar" />
                            <view class="chat-item-right">
                                <view class="chat-item-right__top">
                                    <view class="name">
                                        {{item.name}}
                                    </view>
                                    <view class="time">
                                        {{item.time}}
                                    </view>
                                </view>
                                <view class="chat-item-right__bottom">
                                    <view class="note emojifont">
                                        {{item.note}}
                                    </view>
                                    <view class="badge-text">
                                        <uni-badge size="normal" :text="item.noReadMsgCount" />
                                    </view>
                                </view>
                            </view>
                        </view>
                    </uni-swipe-action-item>
                </uni-swipe-action>
            </uni-list>
            <uni-fab @fabClick="clickLeft()" :pop-menu="false" horizontal="right" vertical="bottom"></uni-fab>
        </view>
        <!-- <tabbar :tabBarShow="2"/> -->
    </pageConfig>
</template>

<script>
    import groupIcon from "../../static/images/group.png"
    import userIcon from "../../static/images/user.png"
    export default {
        data() {
            return {
                groupIcon,
                userIcon,
                defaultList: [
                    // {
                    // 	id: "001",
                    // 	name: "知心小夏",
                    // 	avatar: oneChat,
                    // 	note: '对话聊天机器人小夏'
                    // },
                    // {
                    // 	id: "002",
                    // 	name: "可爱大白",
                    // 	avatar: sevenChat,
                    // 	note: '可可爱爱机器人大白'
                    // },
                    // {
                    // 	id: "003",
                    // 	name: "憨逼小木",
                    // 	avatar: sixChat,
                    // 	note: '憨憨机器人小木'
                    // },
                ],
                userList: [],
                options2: [{
                        text: '取消',
                        style: {
                            backgroundColor: '#007aff'
                        }
                    },
                    {
                        text: '删除',
                        style: {
                            backgroundColor: '#F56C6C'
                        }
                    }
                ],
            }
        },
        components: {},
        onPullDownRefresh() {
            this.init()
        },
        onShow() {
            this.init()
        },
        onReady() {},
        onNavigationBarButtonTap() {
            this.clickLeft()
        },
        methods: {
            init() {
                const userId = getApp().globalData.userInfo.userId
                console.log({
                    userId
                })
                if (!userId) {
                    this.userList = []
                    return
                }
                this.$api.get("/mobile/chat/friends", {
                    userId: userId
                }).then(res => {
                    uni.stopPullDownRefresh()
                    this.userList = res.data.map((v, i) => {
                        v.avatar = v.userInfo.avatar || userIcon
                        if (v.groupId) {
                            v.avatar = v.chatGroup.avatar || groupIcon
                        }
                        v.name = v.userInfo.nickName || v.chatGroup.groupName
                        v.time = this.$dayjs(v.lastInfoTime).format('MM-DD HH:mm')
                        v.note = v.lastMsg
                        if (v.msgType === 2) {
                            v.note = "[图片]"
                        } else if (v.msgType === 3) {
                            v.note = "[视频]"
                        }else if (v.msgType === 4) {
                            v.note = "[语音]"
                        }
                        return v
                    })
                    this.initFriend()
                }).finally(() => {

                    // console.log("======================================", "stopPullDownRefresh")
                    uni.stopPullDownRefresh()
                })

            },
            clickUserItem(item) {
                if (!this.$common.getUserId()) {
                    this.$common.showLoginModal()
                    return
                }
                let str = ''
                if (item.groupId) {
                    str = "&groupId=" + item.groupId
                } else {
                    str = "&friendId=" + item.friendId
                }
                uni.navigateTo({
                    url: "/packageA/pages/chat/chatDetail?name=" + item.name + str
                })
            },
            clickLeft() {
                if (!this.$common.getUserId()) {
                    this.$common.showLoginModal()
                    return
                }
                uni.showActionSheet({
                    itemList: ['添加好友', '加入群聊'],
                    success: (res) => {
                        if (res.tapIndex === 0) {
                            uni.navigateTo({
                                url: "/packageA/pages/chat/addFriend?name=添加好友&type=friend"
                            })
                        } else if (res.tapIndex === 1) {
                            uni.navigateTo({
                                url: "/packageA/pages/chat/addFriend?name=添加群&type=group"
                            })
                        }
                    },
                    fail: function(res) {
                        console.log(res.errMsg);
                    }
                })
            },
            // 点击默认功能列表
            clickDefaultItem(item) {
                uni.navigateTo({
                    url: `/packageA/pages/chat/chatAiDetail?id=${item.id}&name=${item.name}&avatar=${item.avatar}`
                })
            },
            bindClick(item, index) {
                if (index === 1) {
                    this.$api.del("/mobile/chat/friends/{friendId}", {
                        friendId: item.friendId
                    }).then(res => {
                        uni.showToast({
                        	title: "删除成功",
                        });
                        this.$refs.swipeAction.closeAll()
                        this.init()
                    })
                }else{
                    this.$refs.swipeAction.closeAll()
                }
            },
            initFriend() {
                this.socketTask = getApp().globalData.socketTask
                this.socketTask.onMessage((res) => {
                    if (res.data) {
                        const revObj = JSON.parse(res.data)
                        if (revObj.cmd !== 'text') {
                            return
                        }
                        // console.log('revObj', revObj.cmd, revObj)
                        const cb = (v) => {
                            v.note = revObj.content
                            v.time = this.$dayjs().format('MM-DD HH:mm')
                            v.noReadMsgCount++
                            if (v.msgType === 2) {
                                v.note = "[图片]"
                            } else if (v.msgType === 3) {
                                v.note = "[视频]"
                            }
                            console.log('vvvvvvvvvvv', v)
                        }
                        if (revObj.groupId) {
                            const v = this.userList.find(v => v.groupId === revObj.groupId)
                            v && cb(v)
                        } else if (revObj.receiverId) {
                            const v = this.userList.find(v => v.friendId === revObj.senderId)
                            v && cb(v)
                        }
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    /* #ifndef MP-WEIXIN */
    @font-face {
        font-family: 'emojifont';
        src: url("https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-02/ae783d4e2fdd42a39f7e6d5042895b50-emojifont.ttf") format("truetype");
    }

    /* #endif */

    .container {
        font-size: 14px;
        min-height: 35vh;

        // 表情样式
        .emojifont {
            font-family: emojifont !important;
            font-style: normal;
        }

        .chat-item {
            display: flex;
            padding: 20rpx 30rpx;
            border-bottom: 1rpx solid #ddd;
            width: 100%;
            .chat-item-right {
                display: flex;
                flex-direction: column;
                flex: 1;
                padding-left: 20rpx;
            }

            .chat-item-right__top {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .name {
                    font-size: 16px;
                    color: #333;
                }

                .time {
                    color: #999;
                    font-size: 12px;
                }
            }

            .chat-item-right__bottom {
                display: flex;
                justify-content: space-between;
                align-items: center;

                .note {
                    color: #999;
                    font-size: 14px;
                }
            }
        }

        .tip {
            text-align: center;
            color: #999;
            font-size: 12px;
            padding: 60rpx;
        }
    }
</style>