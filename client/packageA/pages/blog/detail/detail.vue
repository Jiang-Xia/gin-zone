<template>
	<view class="article-detail">
		<view class="cover">
			<image :src="articleInfo.cover"></image>
		</view>
		<view class="article-content">
			<!-- #ifdef H5||APP-PLUS -->
			<rich-text selectable class="md-preview default-theme md md-previewOnly" :nodes="nodes"></rich-text>
			<!-- #endif -->

			<!-- #ifdef MP-WEIXIN -->
			<mp-html :content="content" />
			<!-- #endif -->
		</view>
	</view>
</template>

<script>
	// #ifdef MP-WEIXIN
	import mpHtml from '@/node_modules/mp-html/dist/uni-app/components/mp-html/mp-html'
	// #endif
	import {
		styleStr
	} from './style.js'
	import {
		marked
	} from 'marked'
	import Prism from 'prismjs';
	import 'prismjs/themes/prism-tomorrow.css';
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
				}
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
				uni.setNavigationBarTitle({title})
				this.share.title = title
				this.share.imageUrl = this.articleInfo.cover
				this.transformMarkdown()
				uni.hideLoading()
			},
			transformMarkdown() {
				// marked 全局变量
				const markdownString = this.markdownString
				// #ifdef H5||APP-PLUS||MP-WEIXIN
				marked.setOptions({
					// 设置代码高亮插件
					highlight: function(code, lang, callback) {
						let result = ''
						result = Prism.highlight(code, Prism.languages.javascript, "javascript")
						callback("", result.toString());
					}
				});
				// #endif

				marked.parse(markdownString, (err, html) => {
					// console.log(html)
					// #ifdef MP-WEIXIN
					this.content = this.setRichTextStyle(html)
					// #endif

					// #ifdef H5||APP-PLUS
					this.nodes = html
					// #endif
				});
			},
			setRichTextStyle(html) {
				return styleStr + html
			}
		}
	}
</script>

<style lang="scss">
	.article-detail {
		user-select: text;
		font-weight: 36rpx;
		padding-bottom: 40rpx;

		.cover {
			height: 400rpx;
			image{
				width: 100%;
				height: 100%;
			}
		}

		.article-content {
			padding:24rpx;
		}
	}
</style>
