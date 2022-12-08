<template>
	<view class="article-detail">
		<image class="cover" :src="articleInfo.cover"></image>

		<view class="article-content">
			<!-- #ifdef H5||APP-PLUS -->
			<rich-text class="md-preview default-theme md md-previewOnly" :nodes="nodes"></rich-text>
			<!-- #endif -->

			<!-- #ifdef MP-WEIXIN -->
			<mp-html :content="contentHtml" :tag-style="tagStyle" />
			<!-- #endif -->
		</view>
	</view>
</template>

<script>
	import parseHtml from "../../../common/utils/html-parser..js"
	import mpHtml from '../../../node_modules/mp-html/dist/uni-app/components/mp-html/mp-html'
	import {
		styleStr
	} from './style.js'
	import {
		marked
	} from 'marked'
	import hljs from 'highlight.js'
	export default {
		data() {
			return {
				articleInfo: {},
				markdownString: '',
				contentHtml: "",
				nodes: [],
				id: "",
				tagStyle: {
					code: ``
				}
			}
		},
		// 不可省略
		components: {
			mpHtml
		},
		onLoad(option) {
			this.id = option.id
			this.getArticleInfo(this.id)
		},
		methods: {
			async getArticleInfo(id, ctx) {
				const res = await this.$api.get('/blog/article/info', {
					id
				})

				this.articleInfo = res.data.info
				this.markdownString = this.articleInfo.contentHtml
				uni.setNavigationBarTitle({
					title: this.articleInfo.title
				})
				this.transformMarkdown()
			},
			transformMarkdown() {
				// marked 全局变量
				const markdownString = this.markdownString
				marked.setOptions({
					// 设置代码高亮插件
					highlight: function(code, lang, callback) {
						let result = ''
						if (lang && hljs.getLanguage(lang)) {
							// TODO 代码块 使其高亮
							result = hljs.highlight(lang, code, true).value;
						} else {
							result = hljs.highlightAuto(code).value;
						}
						callback("", result.toString());
					}
				});

				marked.parse(markdownString, (err, html) => {
					this.contentHtml = styleStr + html
					this.nodes = parseHtml(html)
				});
			}
		}
	}
</script>

<style lang="scss">
	.article-detail {
		font-weight: 36rpx;
		padding-bottom: 40rpx;
		.cover {
			width: 100%;
		}

		.article-content {
			padding: 28rpx;
		}
	}
</style>
