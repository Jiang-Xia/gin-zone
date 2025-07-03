<template>
    <view class="page-total">
        <view class="tab-list">
            <view class="list" v-for="(item, index) in TabBarList" @click="onTabBar(item, index)" :key="index">
                <image :src="item.selectedIconPath" mode="widthFix" v-show="tabBarShow === index"></image>
                <image :src="item.iconPath" mode="widthFix" v-show="tabBarShow != index"></image>
                <text :class="{ action: tabBarShow === index }">{{ item.text }}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            TabBarList: [
                {
                    text: "博客",
                    pagePath: "/pages/blog/index",
                    iconPath: "/static/icon/index1.png",
                    selectedIconPath: "/static/icon/index.png",
                },
                {
                    text: "动态",
                    pagePath: "/pages/moment/index",
                    iconPath: "/static/icon/dt1.png",
                    selectedIconPath: "/static/icon/dt.png",
                },
                // {
                //     text: "聊天",
                //     pagePath: "/pages/chat/index",
                //     iconPath: "/static/icon/chat1.png",
                //     selectedIconPath: "/static/icon/chat.png",
                // },
                {
                    text: "聊天",
                    pagePath: "/pages/chat/index",
                    iconPath: "/static/icon/chat1.png",
                    selectedIconPath: "/static/icon/chat.png",
                },
                {
                    text: "我的",
                    pagePath: "/pages/my/index",
                    iconPath: "/static/icon/my1.png",
                    selectedIconPath: "/static/icon/my.png",
                },
            ],
            codeheight: 0,
            isOverall: 0,
            phoneModel: "",
        };
    },
    props: {
        tabBarShow: {
            type: Number,
            default: 0,
        },
    },
    
    mounted() {
        try {
            const res = uni.getSystemInfoSync();
            let that = this;
            // 获取系统信息
            uni.getSystemInfo({
                success(res) {
                    console.log(res.brand); //手机牌子
                    console.log(res.model); //手机型号
                    console.log(res.screenWidth); //屏幕宽度
                    console.log(res.screenHeight); //屏幕高度
                    that.codeheight = Math.round(res.screenHeight);
                    that.phoneModel = res.model;
                    if (res.model.search("iPhone")) {
                        that.isOverall = 0;
                    } else if (Math.round(res.screenHeight) > 740) {
                        that.isOverall = 1;
                    }
                    console.log(that.isOverall);
                },
            });
        } catch (e) {
            // error
        }
    },
    methods: {
        /**
         * @param {Object} item
         * @param {Number} index
         */
        onTabBar(item, index) {
            // this.tabBarShow = index;
            const url = this.TabBarList[index].pagePath
            uni.switchTab({url})
            // switch (index) {
            //     case 0:
            //         wx.switchTab({
            //             url: "/pages/home/home",
            //         });
            //         break;
            //     case 1:
            //         wx.switchTab({
            //             url: "/pages/classify/classify",
            //         });
            //         break;
            //     case 2:
            //         wx.switchTab({
            //             url: "/pages/discover/discover",
            //         });
            //         break;
            //     case 3:
            //         wx.switchTab({
            //             url: "/pages/cart/cart",
            //         });
            //         break;
            //     case 4:
            //         wx.switchTab({
            //             url: "/pages/my/my",
            //         });
            //         break;
            // }
        },
    },
};
</script>

<style scoped lang="scss">
.page-total {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    // height: 100rpx;
}

.tab-list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100rpx;
    background-color: #ffffff;

    .list {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 20%;
        height: 100rpx;

        image {
            width: 48rpx;
            height: 48rpx;
        }

        text {
            color: #333333;
            font-size: 24rpx;
            margin-top: 10rpx;
        }

        .action {
            color: $uni-color-primary;
        }
    }
}
</style>
