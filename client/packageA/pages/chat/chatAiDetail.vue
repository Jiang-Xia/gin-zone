<template>
<pageConfig :title="title">
	<view class="container">
		<!-- <image v-if="history.loading" class="history-loaded" src="/static/images/loading.svg" />
				<view v-else :class="history.allLoaded ? 'history-loaded':'load'" @click="loadHistoryMessage(false)">
					<view>{{ history.allLoaded ? '已经没有更多的历史消息' : '点击获取历史消息' }}</view>
				</view>
		-->
		<view class="chat-list-wrap">
			<checkbox-group>
				<!--消息记录-->
				<view v-for="(message,index) in history.messages" :key="message.messageId">
					<!--时间显示，类似于微信，隔5分钟不发言，才显示时间-->
					<view class="time-lag">
						{{ renderMessageDate(message, index) }}
					</view>
					<view class="message-item" :class="[message.type===1?'message-item-me':'']">
						<view class="avatar">
							<image :src="message.type===2?curOption.avatar:curUserAvatar"></image>
						</view>
						<view class="content">
							<view class="text-content emojifont">
								<rich-text selectable class="md-preview default-theme md md-previewOnly"
									:nodes="message.content"></rich-text>
							</view>
						</view>
					</view>
				</view>
			</checkbox-group>
		</view>
		<view class="action-box">
			<view class="action-top">
				<input v-model="text" class="consult-input emojifont" :adjust-positio="false" @confirm="sendTextMessage()"
					confirm-type="send" maxlength="700" placeholder="输入内容" type="text" />

				<view v-if="text" class="send-btn-box">
					<text class="btn" @click="sendTextMessage()">发送</text>
				</view>
			</view>
		</view>
		<!-- 悬浮按钮 -->
		<!-- <uni-fab ref="fab" :popMenu="false" :pattern="fabPattern" :content="fabContent" horizontal="right" vertical="top"
			direction="horizontal" @trigger="trigger" @fabClick="fabClick" /> -->
	</view>
</pageConfig>
</template>

<script>
	import {
		beforeTimeNow
	} from '@/common/utils/util.js';
	import parseHtml from "@/common/utils/html-parser.js"
	import {
		marked
	} from 'marked'
	import Prism from 'prismjs';
	import 'prismjs/themes/prism-tomorrow.css';
	export default {
		data() {
			return {
                title:'',
				ws: '',
				//聊天文本框
				text: '',
				navTitle: "AI聊天",
				history: {
					page: 1,
					messages: [],
					allMessages: [],
					allLoaded: false,
					loading: false
				},
				sceneList: [{
						"maxTokens": 150,
						"model": "gpt-3.5-turbo",
						"frequencyPenalty": 0.0,
						"presencePenalty": 0.6,
						"name": "对话聊天",
						"suffix": "小夏",
						"temperature": 0.9,
						"topP": 1
					},
					{
						"maxTokens": 100,
						"model": "text-davinci-003",
						"frequencyPenalty": 0.0,
						"presencePenalty": 0.0,
						"name": "Q&A",
						"temperature": 0.0,
						"topP": 1
					},
					{
						"maxTokens": 60,
						"model": "text-davinci-003",
						"frequencyPenalty": 0.8,
						"presencePenalty": 0.0,
						"name": "恐怖故事",
						"temperature": 0.8,
						"topP": 1
					},
					{
						"maxTokens": 150,
						"model": "text-davinci-003",
						"frequencyPenalty": 0.0,
						"presencePenalty": 0.0,
						"name": "面试问答",
						"temperature": 0.5,
						"topP": 1.0
					},
					{
						"maxTokens": 150,
						"model": "text-davinci-003",
						"frequencyPenalty": 0.0,
						"presencePenalty": 0.0,
						"name": "论文大纲",
						"temperature": 0.3,
						"topP": 1.0
					}
				],
				curScene: {},
				curOption: {},
				timer: null,

				/* 悬浮按钮配置 开始*/
				fabPattern: {
					color: '#7A7E83',
					backgroundColor: '#fff',
					selectedColor: '#007AFF',
					buttonColor: '#007AFF',
					iconColor: '#fff',
				},
				fabContent: [{
						text: '相册',
						active: false
					},
					{
						text: '首页',
						active: false
					},
					{
						text: '收藏',
						active: false
					}
				],
				openAiKey: "",
				curId: ''
			}
		},
		async onLoad(option) {
			this.curOption = option
			marked.setOptions({
				// 设置代码高亮插件
				highlight: function(code, lang, callback) {
					let result = ''
					result = Prism.highlight(code, Prism.languages.javascript, "javascript")
					callback("", result.toString());
				}
			});
			this.navTitle = option.name
			this.curScene = this.sceneList[0]
			const string = uni.getStorageSync(this.storageKey)
			if (string) {
				const list = JSON.parse(string) || []
				this.history.allMessages = list
			}
			this.setNavBarTitle()
			const {
				data: openAiKey
			} = await this.$api.post('/third/chatGPT', {
				keyCode: 'j123456'
			})
			this.openAiKey = openAiKey.slice(0, openAiKey.length - 2)
		},
		onReady() {
			this.loadHistoryMessage(true);
		},
		onPullDownRefresh(e) {
			this.loadHistoryMessage(false);
		},
		onNavigationBarButtonTap() {
			this.clickRight()
		},
		onShow() {},
		computed: {
			storageKey(){
				return 'robot'+this.curOption.id+'_historyMessages'
			},
			curUserAvatar() {
				const userInfo = getApp().globalData.userInfo
				return userInfo.avatar ||
					"https://jiang-xia.top/x-api/blog-server/static/uploads/2022-08-10/8ojhda8gzvyx3rdhgyq378-头像.jpg"
			},
			rightWidth() {
				return "90px"
			}
		},
		methods: {
			setNavBarTitle() {
				const title = this.curOption.name + `(${this.curScene.name})`
				uni.setNavigationBarTitle({
					title
				})
				this.share.title = title
                this.title = title
			},
			clickLeft() {
				uni.switchTab({
					url: "/pages/chat/index"
				})
			},
			clickRight() {
				this.openSceneSelect()
			},
			// 发送消息
			async sendTextMessage(messageData) {
				if (!this.text) {
					uni.showToast({
						title: "内容不能为空"
					})
					return
				}
				try {
					const content = this.text
					this.text = ""
					let mdContent = await this.transformMarkdown(content)
					this.history.messages.push({
						content: mdContent,
						createdAt: new Date(),
						type: 1
					})
					this.resetBottom()
					uni.showLoading({
						title: '拼命加载中',
						mask: true
					})
					let sendParams = {
						id: '',
						message: content
					}
					let message = ''
					const res = await this.$api.post('/third/chatGPTApi', sendParams)
					if (res) {
						message = res.data.text
					}
					if (message) {
						message = await this.transformMarkdown(message)
						this.history.messages.push({
							content: message,
							createdAt: new Date(),
							type: 2
						})
					}
					if (this.history.messages.length > 100) {
						this.history.messages.shift()
					}
					this.resetBottom()
					uni.hideLoading()
					uni.setStorageSync(this.storageKey, JSON.stringify(this.history.messages))
				} catch (e) {
					console.error(e)
				}
			},
			async loadHistoryMessage(scrollToBottom) {
				// for (let item of this.history.allMessages) {
				// 	item.content = await this.transformMarkdown(item.content)
				// }
				this.history.messages = this.history.allMessages
				if (scrollToBottom) {
					this.resetBottom()
				}
			},
			// 选择场景
			openSceneSelect() {
				uni.showActionSheet({
					itemList: this.sceneList.map(v => v.name),
					success: (res) => {
						const item = this.sceneList[res.tapIndex]
						this.curScene = item
						this.setNavBarTitle()
						console.log({
							item
						});
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});

			},
			// 渲染消息时间
			renderMessageDate(item, index) {
				const timestamp = new Date(item.createdAt).getTime()
				const now = new Date().getTime()
				const min5 = 5 * 60 * 1000
				if (index === 0) {
					if (now - timestamp > min5) {
						return beforeTimeNow(timestamp)
					} else {
						return ''
					}
				} else {
					const preTimestamp = new Date(this.history.messages[index - 1].createdAt).getTime()
					// 判断一批信息时间是否在五分钟区间内
					if (timestamp - preTimestamp > min5) {
						return beforeTimeNow(timestamp)
					}
				}
				return '';
			},
			resetBottom() {
				// 直接设置最大值跳
				this.$nextTick(() => {
					uni.pageScrollTo({
						scrollTop: 2000000,
						duration: 0
					});
				});
			},
			/* 悬浮按钮回调开始 */
			trigger(e) {
				console.log(e)
				this.content[e.index].active = !e.item.active
				uni.showModal({
					title: '提示',
					content: `您${this.content[e.index].active ? '选中了' : '取消了'}${e.item.text}`,
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定')
						} else if (res.cancel) {
							console.log('用户点击取消')
						}
					}
				})
			},
			fabClick() {
				this.clickRight()
			},
			transformMarkdown(markdownString) {
				return new Promise((resove, reject) => {
					marked.parse(markdownString, (err, html) => {
						let nodes = parseHtml(html)
						console.log({
							nodes
						})
						resove(nodes)
					});
				})
			}
		}
	}
</script>

<style lang="scss">
	.container {
		user-select:text;
	}

	.chat-list-wrap {
		padding: 12rpx 12rpx 140rpx 12rpx;
	}

	page {
		background-color: #f5f5f5;
	}

	// 加载更多消息
	.history-loaded {
		font-size: 24rpx;
		height: 60rpx;
		line-height: 60rpx;
		width: 100%;
		text-align: center;
		color: #cccccc;
	}

	.load {
		font-size: 24rpx;
		height: 60rpx;
		line-height: 60rpx;
		width: 100%;
		text-align: center;
		color: #d02129;
	}

	.time-lag {
		font-size: 20rpx;
		text-align: center;
		transform: scale(0.8);
	}

	// 消息item
	.message-item {
		display: flex;
		margin: 20rpx 0;

		.message-item-content {
			flex: 1;
			overflow: hidden;
			display: flex;
		}

		.message-item-checkbox {
			height: 80rpx;
			display: flex;
			align-items: center;
		}

		// 头像
		.avatar {
			width: 80rpx;
			height: 80rpx;
			flex-shrink: 0;
			flex-grow: 0;

			image {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
		}

		// 昵称
		.nickname {
			color: $uni-text-color-grey;
			font-size: 13px;
		}

		.content {
			font-size: 34rpx;
			line-height: 44rpx;
			margin: 0 12rpx;
			max-width: calc(100% - 48px);
		}

		.text-content {
			position: relative;
			min-width: 1em;
			padding: 12rpx;
			border-radius: 12rpx;
			color: #000000;
			background: #FFFFFF;
			word-break: break-all;
			text-align: left;
			vertical-align: center;
			display: block;
			font-size: 28rpx;
			img {
				width: 50rpx;
				height: 50rpx;
			}

			&::before {
				content: " ";
				display: block;
				width: 0px;
				height: 0px;
				border-top: 4px solid transparent;
				border-bottom: 4px solid transparent;
				border-right: 4px solid #FFFFFF;
				position: absolute;
				top: 10px;
				left: -4px;
			}
		}
		// 代码风格
		.default-theme{
			pre {
			    margin: 8px 0;
			}
			p{
				padding: 0;
			}
		}
	}

	// 我的消息
	.message-item-me {
		justify-content: flex-end;

		.nickname {
			text-align: right;
		}

		.avatar {
			order: 1;
		}

		.text-content {
			background-color: #0199fe;
			box-shadow: inset 0 0 6rpx rgba(0, 0, 0, .12);
			color: #FFFFFF;

			&::before {
				left: auto;
				right: -4px !important;
				border-right-color: #0199fe;
				transform: rotateZ(180deg);
			}
		}

		.md {
			background-color: #0199fe;
		}
	}

	// 群组消息
	.message-item-group {}

	/* 输入框 开始  */
	.action-box {
		display: flex;
		backdrop-filter: blur(0.27rpx);
		width: 100%;
		position: fixed;
		bottom: 0;
		left: 0;
		flex-direction: column;
		background-color: #F1F1F1;
	}

	.action-top {
		display: flex;
		align-items: center;
		box-sizing: border-box;
		background: #F6F6F6;
		backdrop-filter: blur(27.1828px);
		border-top: 1px solid #ECECEC;
		padding: 0 20rpx;
	}

	.consult-input {
		flex: 1;
		height: 80rpx;
		padding-left: 20rpx;
		margin: 20rpx 0;
		border: none;
		outline: none;
		box-sizing: border-box;
		border-radius: 6px;
		background: #FFFFFF;
		font-size: 32rpx;
	}

	.more {
		width: 62rpx;
		height: 62rpx;
		margin-right: 10rpx;
		display: flex;
	}

	.send-btn-box {
		margin-left: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 110rpx;
		height: 60rpx;
		border-radius: 10rpx;
		background: $uni-color-primary;

	}

	.scene-btn {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.send-btn-box .btn {
		color: #FFFFFF;
		font-size: 28rpx;
	}

	.action-bottom {
		height: 300rpx;
		width: 100%;
		padding: 20rpx;
		box-sizing: border-box;
		display: flex;
	}

	.action-bottom-emoji {
		justify-content: space-around;
		padding: 8rpx;
	}

	.action-bottom image {
		width: 100rpx;
		height: 100rpx;
	}

	.action-box .action-bottom .more-icon {
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 0 30rpx;
	}

	.action-box {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
	}

	.action-box .action-bottom .operation-icon {
		width: 60rpx;
		height: 60rpx;
		min-width: 60rpx;
		min-height: 60rpx;
		padding: 25rpx;
		border-radius: 20rpx;
		background: #FFFFFF;
	}

	.action-box .action-bottom .operation-title {
		font-size: 24rpx;
		line-height: 50rpx;
		color: #82868E;
	}

	.action-box .action-top .record-input {
		flex: 1;
		width: 480rpx;
		height: 80rpx;
		line-height: 80rpx;
		padding-left: 20rpx;
		margin: 20rpx;
		margin-left: 0;
		border: none;
		outline: none;
		box-sizing: border-box;
		border-radius: 6px;
		background: #cccccc;
		color: #FFFFFF;
		font-size: 28rpx;
		text-align: center;
	}

	/* 输入框 结束  */

	/* 历史记录消息 */
</style>