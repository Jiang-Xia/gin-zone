<template>
    <view class="page-config">
        <!-- #ifndef MP-ALIPAY || APP-PLUS -->
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
        <!-- #endif -->
        <view class="page-container">
            <slot></slot>
        </view>
        <global-modal ref="globalModalRef" />
    </view>
</template>

<script>
    import GlobalModal from '@/components/global/GlobalModal.vue'
    import { registerCustomModalOpener } from '@/common/utils/ui.js'
    export default {
        name: "pageConfig",
        components: {
            GlobalModal,
        },
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
                default: ''
            }
        },
        data() {
            return {

            };
        },
        created() {
            // #ifdef MP-ALIPAY
            if(this.title){
                uni.setNavigationBarTitle({
                  title: this.title,
                });
            }
            uni.setNavigationBarColor({
              backgroundColor:'#ffffff',
              frontColor:'#000000'
            });
            // #endif
        },
        mounted() {
            registerCustomModalOpener((options) => {
                const modalRef = this.$refs.globalModalRef
                if (!modalRef || typeof modalRef.open !== 'function') {
                    return new Promise((resolve, reject) => {
                        uni.showModal({
                            ...(options || {}),
                            success: resolve,
                            fail: reject,
                        })
                    })
                }
                return modalRef.open(options)
            })
        },
        beforeUnmount() {
            registerCustomModalOpener(null)
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
        .page-container{
            padding-top: 0.5px;
        }
    }
</style>