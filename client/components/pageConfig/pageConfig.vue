<template>
    <view class="page-config">
        <uni-nav-bar backgroundColor="#ffffff" v-if="navbar" class="global-nav" fixed :border="border" statusBar @clickLeft="clickLeft">
            <view class="nav-title">{{title}}</view>
            <template v-slot:left>
                <slot name="left">
                    <uni-icons v-if="!!left" :type="leftIcon" size="24"></uni-icons>
                </slot>
            </template>
            <template v-slot:right>
                <slot name="right" >
                    <uni-icons v-if="right" type="right" size="24"></uni-icons>
                </slot>
            </template>
        </uni-nav-bar>
        <view class="page-container">
            <slot></slot>
        </view>
    </view>
</template>

<script>
    export default {
        name: "pageConfig",
        props: {
            right: {
                type: Boolean,
                default: false,
            },
            left: {
                type: Boolean,
                default: true,
            },
            leftIcon: {
                type: String,
                default: 'left',
            },
            customBack: {
                type: Boolean,
                default: false,
            },
            border: {
                type: Boolean,
                default: false,
            },
            navbar: {
                type: Boolean,
                default: true,
            },
            title: {
                type: String,
                default: '标题栏'
            }
        },
        data() {
            return {

            };
        },
        methods:{
            clickLeft(){
                if(this.leftIcon === 'left'){
                    console.log('clickLeft ------------>', )
                    if(this.customBack){
                        this.$emit('back')
                    }else{
                        this.$common.back()
                    }
                }
                this.$emit('clickLeft')
            }
        }
    }
</script>

<style lang="less">
    .page-config {
      
    }
</style>