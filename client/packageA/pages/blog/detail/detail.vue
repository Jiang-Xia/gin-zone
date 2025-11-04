<template>
    <pageConfig :title="title">
        <view class="article-detail">
            <view class="cover">
                <image :src="articleInfo.cover"></image>
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