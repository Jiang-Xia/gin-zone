<template>
    <pageConfig :title="title">
        <view class="article-detail">
            <view class="cover">
                <image :src="articleInfo.cover"></image>
            </view>
            <view class="main-container">
                <view class="article-content">
                    <!-- #ifdef H5||APP-PLUS-->
                    <rich-text selectable class="md-preview default-theme md md-previewOnly" :nodes="nodes"></rich-text>
                    <!-- #endif -->

                    <!-- #ifdef MP-WEIXIN -->
                    <mp-html :content="content" markdown/>
                    <!-- #endif -->
                </view>
            </view>
        </view>
    </pageConfig>
</template>

<script>
    // #ifndef MP-ALIPAY||MP-WEIXIN
    import {
        styleStr
    } from './style.js'
    import {
        marked
    } from 'marked'
    import Prism from 'prismjs';
    import 'prismjs/themes/prism-tomorrow.css';
    // #endif

    export default {
        data() {
            return {
                articleInfo: {},
                markdownString: '',
                content: "",
                nodes: [],
                id: "",
                tagStyle: {
                    code: ``
                },
                title: '博客详情'
            }
        },
        // 不可省略
        components: {
        },
        onLoad(option) {
            this.id = option.id
            this.getArticleInfo(this.id)
        },
        methods: {
            async getArticleInfo(id, ctx) {
                uni.showLoading({
                    title: ''
                })
                const res = await this.$api.get('/blog/article/info', {
                    id
                })
                this.articleInfo = res.data.info
                this.markdownString = this.articleInfo.content
                const title = this.articleInfo.title
                uni.setNavigationBarTitle({
                    title
                })
                this.title = title
                this.share.title = title
                this.share.imageUrl = this.articleInfo.cover
                this.transformMarkdown()
                uni.hideLoading()
            },
            transformMarkdown() {
                // marked 全局变量
                const markdownString = this.markdownString
                // #ifdef H5||APP-PLUS
                marked.setOptions({
                    // 设置代码高亮插件
                    highlight: function(code, lang, callback) {
                        let result = ''
                        result = Prism.highlight(code, Prism.languages.javascript, "javascript")
                        callback("", result.toString());
                    }
                });
                marked.parse(markdownString, (err, html) => {
                    this.nodes = html
                });
                // #endif
                
                // #ifdef MP-WEIXIN
                // 设置语言才会高亮
                this.content = markdownString.replace(/(```language|```javascript|```typescript|```golang|```sql)/ig, '```javascript')
                // #endif
                
            },
            setRichTextStyle(html) {
                return html
            }
        }
    }
</script>

<style lang="scss">
    .article-detail {
        user-select: text;
        font-weight: 36rpx;
        padding-bottom: 40rpx;

        .main-container {
            margin-top: 24rpx;
        }

        .cover {
            height: 400rpx;

            image {
                width: 100%;
                height: 100%;
            }
        }

        .article-content {
            padding: 24rpx;
            background-color: #fff;
        }
    }
</style>