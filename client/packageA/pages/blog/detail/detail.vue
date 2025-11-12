<template>
    <pageConfig :title="title">
        <view class="article-detail">
            <view class="cover">
                <image :src="articleInfo.cover"></image>
            </view>
            <view class="article-meta">
                <view class="article-title">{{ articleInfo.description }}</view>
                <view class="meta-info">
                    <view class="meta-item">
                        <uni-icons type="person" size="14" color="#666"></uni-icons>
                        <text class="meta-text">{{ articleInfo.userInfo?.nickname || '未知作者' }}</text>
                    </view>
                    <view class="meta-item">
                        <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                        <text class="meta-text">{{ articleInfo.uTime }}</text>
                    </view>
                    <view class="meta-item">
                        <uni-icons type="eye" size="14" color="#666"></uni-icons>
                        <text class="meta-text">{{ articleInfo.views || 0 }}</text>
                        <uni-icons type="hand-up" size="14" color="#666"></uni-icons>
                        <text class="meta-text">{{ articleInfo.likes || 0 }}</text>
                    </view>
                </view>
                <view class="article-tags" v-if="articleInfo.tags && articleInfo.tags.length > 0">
                     <text>标签：</text>
                    <view class="tag" v-for="tag in articleInfo.tags" :key="tag" :style="{backgroundColor: tag.color}">
                        <text class="tag-text">{{ tag.label }}</text>
                    </view>
                </view>
                <view class="article-tags" v-if="articleInfo.category">
                    <text>分类：</text>
                    <view class="tag" :style="{backgroundColor: articleInfo.category.color}">
                        <text class="tag-text">{{ articleInfo.category.label }}</text>
                    </view>
                </view>
            </view>
            <view class="main-container">
                <view class="article-content">
                    <!-- #ifdef H5||APP-PLUS || MP-ALIPAY-->
                    <rich-text selectable class="md-preview default-theme md md-previewOnly" :nodes="nodes"></rich-text>
                    <!-- #endif -->

                    <!-- #ifdef MP-WEIXIN -->
                    <mpHtml :content="content" markdown />
                    <!-- #endif -->
                </view>
            </view>
        </view>
    </pageConfig>
</template>

<script>
    import {styleStr} from './style.js'
    import { marked } from 'marked'
    import { formatTime } from '@/common/utils/util.js'
    
    // #ifdef MP-ALIPAY
    // import { markedHighlight } from "marked-highlight";
    // import hljs from 'highlight.js';
    // import 'highlight.js/styles/atom-one-dark-reasonable.min.css';
    // #endif
    
    // #ifndef MP-WEIXIN||MP-ALIPAY
    import Prism from 'prismjs';
    import 'prismjs/themes/prism-tomorrow.css';
    // #endif
        
    // #ifdef MP-WEIXIN
    import mpHtml from '../../../components/mp-html/mp-html.vue'
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
            // #ifdef MP-WEIXIN
            mpHtml
            // #endif
        },
        onLoad(option) {
            this.id = option.id
            this.getArticleInfo(this.id)
        },
        methods: {
            formatTime,
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
                        let result = code
                        // #ifndef MP-ALIPAY
                        result = Prism.highlight(code, Prism.languages.javascript, "javascript")
                        // #endif
                        callback("", result.toString());
                    }
                });
                // #endif
                // #ifdef MP-ALIPAY
               // marked.setOptions({
               //     emptyLangClass: 'hljs',
               //     langPrefix: 'hljs language-',
               //     highlight(code, lang, callback) {
               //       const language = hljs.getLanguage(lang) ? lang : 'javascript';
               //       let result = hljs.highlight(code, { language }).value;
               //       // console.log('result', result)
               //       callback("", result.toString());
               //     }
               // });
                // #endif
                
                // #ifndef MP-WEIXIN
                const html =  marked.parse(markdownString, (err, html) => {
                     // console.log('html', err, html)
                     this.nodes = html
                 });
                // #endif
                
                // #ifdef MP-WEIXIN
                // 设置语言才会高亮
                this.content = markdownString.replace(/(```language|```javascript|```typescript|```golang|```sql)/ig,
                    '```javascript')
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
        position: relative;
        .article-meta {
            box-sizing: border-box;
            position: absolute;
            top: 20rpx;
            left: 20rpx;
            width: calc(100% - 40rpx);
            background: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
            border-radius: 16rpx;
            padding: 20rpx 0;
            backdrop-filter: blur(15px); /* 毛玻璃效果 */
            padding: 24rpx;
            margin-bottom: 6rpx;
            box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
            min-height: 360rpx;

            .article-title {
                font-size: 30rpx;
                font-weight: 500;
                color: #333;
                line-height: 1.2;
                margin-bottom: 20rpx;
                max-height: 112rpx;
                overflow: hidden;
            }

            .meta-info {
                display: flex;
                flex-wrap: wrap;
                gap: 24rpx;
                margin-bottom: 20rpx;

                .meta-item {
                    display: flex;
                    align-items: center;
                    font-size: 24rpx;
                    color: #666;

                    .meta-text {
                        margin-left: 8rpx;
                    }
                }
            }

            .article-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 16rpx;
                margin-bottom: 20rpx;
                font-size: 24rpx;
                color: #666;
                .tag {
                    display: flex;
                    align-items: center;
                    background-color: rgba(255, 255, 255, 0.4);
                    border-radius: 30rpx;
                    padding: 6rpx 16rpx;
                    font-size: 20rpx;
                    color: #fff;

                    .tag-text {
                        margin-left: 6rpx;
                    }
                }
            }
        }

        .main-container {
            margin-top: 24rpx;
        }

        .cover {
            height: 400rpx;
            // filter: blur(28px) brightness(.95);
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