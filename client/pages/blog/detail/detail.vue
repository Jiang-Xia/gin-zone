<template>
	<view>
		<!-- <rich-text class="md-preview default-theme" :nodes="contentHtml"></rich-text> -->
		<!-- <rich-text :nodes="nodes"></rich-text> -->
		<view class="md-preview default-theme" v-html="contentHtml"></view>
	</view>
</template>

<script>
	import parseHtml from "../../../common/utils/html-parser..js"
	// import marked from 'marked'
	import {marked} from 'marked'
	import hljs from 'highlight.js'
	export default {
		data() {
			return {
				articleInfo: {},
				contentHtml: "",
				nodes: [],
				id:""
			}
		},
		created() {
			// this.getArticleInfo()
		},
		onShow(option) {
			// this.getArticleInfo(this.id)
		},
		onLoad(option) {
			this.id = option.id
			this.getArticleInfo(this.id)
		},
		methods: {
			async getArticleInfo(id) {
				const res = await this.$api.get('/blog/article/info', {
					id
				})
				this.articleInfo = res.data.info
				this.transformMarkdown()
			},
			transformMarkdown() {
				// marked 全局变量
				const markdownString = this.articleInfo.contentHtml
				marked.setOptions({
					// 设置代码高亮插件
					highlight: function(code, lang, callback) {
						let result = ''
						if (lang && hljs.getLanguage(lang)) {
							// TODO 代码块 使其高亮
							result =  hljs.highlight(lang, code, true).value;
						} else {
							result =  hljs.highlightAuto(code).value;
						}
						callback("", result.toString());
					}
				});

				marked.parse(markdownString, (err, html) => {
					console.log(err, html)
					this.contentHtml = html
				});
				// this.nodes = parseHtml(this.contentHtml)
				// this.highlightAuto(code, languageSubset) 

				// console.log(this.nodes)
			}
		}
	}
</script>

<style>

</style>
