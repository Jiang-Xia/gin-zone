<template>
<pageConfig :title="title">
	<view class="container">
		<image v-if="history.loading" class="history-loaded" src="/static/images/loading.svg" />
		<view v-else :class="history.allLoaded ? 'history-loaded':'load'" @click="loadHistoryMessage(false)">
			<view>{{ history.allLoaded ? '已经没有更多的历史消息' : '点击获取历史消息' }}</view>
		</view>

		<checkbox-group @change="selectMessages">
			<!--消息记录-->
			<view v-for="(message,index) in history.messages" :key="message.messageId">
				<!--时间显示，类似于微信，隔5分钟不发言，才显示时间-->
				<view class="time-lag">
					{{ renderMessageDate(message, index) }}
				</view>
				<view class="message-item"
					:class="[message.senderId===userId?'message-item-me':'',message.groupId?'message-item-group':'']">
					<view class="avatar">
						<image :src="message.userInfo?.avatar"></image>
					</view>
					<view class="content">
						<!-- 群聊时显示用户名称 -->
						<view class="nickname" v-if="curOption.groupId">
							{{message.userInfo?.nickName}}
						</view>
						<view class="text-content emojifont" v-if="message.msgType===1">{{message.content}}</view>
						<view class="image-content" v-if="message.msgType===2">
							<image :src="$fileUrl+message.content" mode="heightFix"></image>
						</view>
						<view class="video-content" v-if="message.msgType===3">{{message.content}}</view>
					</view>
				</view>
			</view>
		</checkbox-group>

		<view class="action-box" v-if="!videoPlayer.visible && !messageSelector.visible">
			<view class="action-top">
				<view @click="switchAudioKeyboard">
					<image class="more" v-if="audio.visible" src="/static/images/jianpan.png"></image>
					<image class="more" v-else src="/static/images/audio.png"></image>
				</view>
				<view v-if="audio.visible" class="record-input" @click="onRecordStart" @touchend.stop="onRecordEnd"
					@touchstart.stop="onRecordStart">
					{{ audio.recording ? '松开发送' : '按住录音' }}
				</view>
				<!-- GoEasyIM最大支持3k的文本消息，如需发送长文本，需调整输入框maxlength值 -->
				<input v-else v-model="text" class="consult-input emojifont" confirm-type="send" maxlength="700"
					placeholder="发送消息" type="text" />
				<view @click="switchEmojiKeyboard">
					<image class="more" v-if="emoji.visible" src="/static/images/jianpan.png"></image>
					<image class="more" v-else src="/static/images/emoji.png"></image>
				</view>
				<view>
					<image @click="showOtherTypesMessagePanel()" class="more" src="/static/images/more.png" />
				</view>
				<view v-if="text" class="send-btn-box">
					<text class="btn" @click="sendTextMessage()">发送</text>
				</view>
			</view>
			<!--展示表情列表-->
			<view class="action-bottom action-bottom-emoji" v-show="emoji.visible">
				<!-- #ifndef MP-WEIXIN -->
				<emojiList ref="emojifont-list"></emojiList>
				<!-- #endif -->
			</view>
			<!--其他类型消息面板-->
			<view v-if="otherTypesMessagePanelVisible" class="action-bottom">

				<view class="more-icon">
					<image @click="sendImageMessage()" class="operation-icon" src="/static/images/picture.png"></image>
					<view class="operation-title">图片</view>
				</view>
				<view class="more-icon">
					<image @click="sendVideoMessage()" class="operation-icon" src="/static/images/video.png"></image>
					<view class="operation-title">视频</view>
				</view>
			</view>
		</view>
	</view>
</pageConfig>
</template>

<script>
	import emojiList from './components/emojifont-list.vue';
	import {
		wsUrl,
	} from '@/common/request/api.js'
	import {
		beforeTimeNow
	} from '@/common/utils/util.js';
	import {
		watch
	} from "vue";
	export default {
		data() {
			return {
                title:'',
				ws: '',
				//聊天文本框
				text: '',
				friend: null,
				to: {}, // 作为createMessage的参数
				currentUser: null,

				//定义表情列表
				emoji: {
					url: '',
					map: {},
					visible: false,
					decoder: '',
				},
				//是否展示‘其他消息类型面板’
				otherTypesMessagePanelVisible: false,
				history: {
					page: 1,
					messages: [],
					allLoaded: false,
					loading: false
				},
				audio: {
					startTime: null,
					//语音录音中
					recording: false,
					//录音按钮展示
					visible: false
				},
				// 音频播放
				audioPlayer: {
					innerAudioContext: null,
					playingMessage: null,
				},
				// 视频播放
				videoPlayer: {
					visible: false,
					url: '',
					context: null
				},
				// 展示消息删除弹出框
				actionPopup: {
					visible: false,
					message: null,
					recallable: false,
				},
				// 消息选择
				messageSelector: {
					visible: false,
					messages: []
				},

				socketOpen: false,
				socketMsgQueue: [],
				socketTask: null,

				curOption: {},
				timer: null,
				selectList: ["删除好友"]
			}
		},
		components: {
			emojiList
		},
		onLoad(option) {
			this.curOption = option
			if (option.groupId) {
				this.selectList = ["退出群聊"]
			}
			console.log(this.curOption)
			uni.setNavigationBarTitle({
				title: option.name
			})
            this.title = option.name
			// uni.loadFontFace({
			// 	global:true,
			//   family: 'emojifont',
			//   source: 'url("/static/iconfont/emojifont.ttf")',
			// 	desc:{
			// 		style:"normal"
			// 	}
			// })
		},
		onUnload() {
			clearInterval(this.timer)
			this.timer = null
		},
		onReady() {
			this.loadHistoryMessage(true);
		},
		onPullDownRefresh(e) {
			this.loadHistoryMessage(false);
		},
		onNavigationBarButtonTap() {
			this.openOptSelect()
		},
		onShow() {
			// 阅读消息
			this.$api.post("/mobile/chat/updateReadTime", this.getCurOption())
			const url = wsUrl + '/mobile/chat?userId=' + this.userId
			const token = uni.getStorageSync("zoneToken")
			this.socketTask = getApp().globalData.socketTask
			this.socketOpen = true;
			this.socketTask.onMessage((res) => {
				if (res.data) {
					const revObj = JSON.parse(res.data)
					if (revObj.cmd === "text") {
						this.history.messages.push(revObj);
						this.resetBottom()
					}
					console.log('服务端消息：', revObj);
				}
			});
		},
		computed: {
			userId() {
				return getApp().globalData.userInfo.userId
			}
		},
		watch: {
			'emoji.visible'(n) {
				this.$nextTick(() => {
					// #ifndef MP-WEIXIN
					this.$refs['emojifont-list'].open({
						confirm: (content) => {
							this.text += content
						}
					})
					// #endif
				})
			}
		},
		methods: {
			heartbeat() {
				this.timer = setInterval(() => {
					this.sendSocketMessage({
						cmd: "heartbeat",
						content: "heartbeat"
					})
				}, 30000)
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
			// 上传文件
			async uploadFile(file) {
				const res = await this.$api.upload(file)
				return res
			},
			getCurOption() {
				const {
					friendId = "", groupId = 0
				} = this.curOption
				let sendObj = {
					senderId: this.userId,
					receiverId: friendId,
					groupId: Number(groupId),
				}
				return sendObj
			},
			// 发送消息
			sendSocketMessage(messageData) {
				console.log("sendSocketMessage", messageData)
				const {
					friendId = "", groupId = 0
				} = this.curOption
				const {
					cmd,
					content,
					msgType
				} = messageData
				const userInfo = getApp().globalData.userInfo
				let sendObj = {
					cmd: cmd,
					senderId: this.userId,
					content: content,
				}
				if (cmd === "heartbeat") {
					console.log("心跳中...")
				} else if (cmd === "text") {
					const mainObj = {
						receiverId: friendId,
						groupId: Number(groupId),
						logType: Number(groupId) ? 2 : 1,
						msgType: msgType,
					}
					sendObj = {
						...sendObj,
						...mainObj
					}
					sendObj.userInfo = {
						...userInfo
					}
					this.history.messages.push(sendObj);
				}
				// 发送消息
				if (this.socketOpen) {
					this.resetBottom()
					this.socketTask.send({
						data: JSON.stringify(sendObj),
						success: () => {
							console.log('发送成功：', sendObj);
						},
						fail: (error) => {
							console.log('发送失败:', error);
						}
					});
				} else {
					this.resetBottom()
					// this.socketMsgQueue.push(sendObj);
				}
			},
			//语音录制按钮和键盘输入的切换
			switchAudioKeyboard() {
				this.audio.visible = !this.audio.visible;
				if (uni.authorize) {
					uni.authorize({
						scope: 'scope.record',
						fail: () => {
							uni.showModal({
								title: '获取录音权限失败',
								content: '请先授权才能发送语音消息！'
							});
						}
					});
				}
			},
			// 表情面板展开
			switchEmojiKeyboard() {
				this.emoji.visible = !this.emoji.visible;
				this.otherTypesMessagePanelVisible = false;
			},
			// 选择表情
			chooseEmoji(emojiKey) {
				this.text += emojiKey;
			},
			// 开始录音
			onRecordStart() {
				try {
					recorderManager.start();
				} catch (e) {
					uni.showModal({
						title: '录音错误',
						content: '请在app和小程序端体验录音，Uni官方明确H5不支持getRecorderManager, 详情查看Uni官方文档'
					});
				}
			},
			// 结束录音
			onRecordEnd() {
				try {
					recorderManager.stop();
				} catch (e) {
					console.log(e);
				}
			},
			// 其他功能
			showOtherTypesMessagePanel() {
				this.otherTypesMessagePanelVisible = !this.otherTypesMessagePanelVisible;
				this.emoji.visible = false;
			},
			// 发送普通消息
			sendTextMessage() {
				if (this.text.trim() !== '') {
					let body = this.text;
					if (this.text.length >= 50) {
						body = this.text.substring(0, 30) + '...';
					}
					const sendObj = {
						cmd: "text",
						content: this.text,
						msgType: 1
					}
					this.sendSocketMessage(sendObj);
				}
				this.text = '';
				this.emoji.visible = false
			},
			// 发送视频
			sendVideoMessage() {
				uni.chooseVideo({
					success: (videoRes) => {
						// console.log(videoRes.tempFilePath)
						this.uploadFile(videoRes.tempFilePath).then(res => {
							const sendObj = {
								cmd: "text",
								content: res.data.url,
								filename: res.data.filename,
								msgType: 3
							}
							this.sendSocketMessage(sendObj);
						})
					}
				})
			},
			// 发送图片
			sendImageMessage() {
				uni.chooseImage({
					count: 9,
					success: (imageRes) => {
						imageRes.tempFilePaths.forEach((path, index) => {
							this.uploadFile(path).then(res => {
								const sendObj = {
									cmd: "text",
									content: res.data.url,
									filename: res.data.filename,
									msgType: 2
								}
								this.sendSocketMessage(sendObj);
							})
						})
					}
				});
			},
			// 选择消息
			selectMessages() {},

			/* 消息记录控制 操作*/
			// 加载历史消息
			loadHistoryMessage(scrollToBottom) { //历史消息
				this.history.loading = true;
				let lastMessageTimeStamp = null;
				let lastMessage = this.history.messages[0];
				if (lastMessage) {
					lastMessageTimeStamp = lastMessage.timestamp;
				}
				const {
					friendId = "", groupId = 0
				} = this.curOption
				const params = {
					page: this.history.page,
					pageSize: 20,
					senderId: this.userId, //好友发送的的信息
					receiverId: friendId, // 好友接收的信息
					groupId: Number(groupId), // 群组的消息
				}
				this.$api.post("/mobile/chat/logs", params).then(res => {
					let {
						list,
						total
					} = res.data
					uni.stopPullDownRefresh();
					list = list.sort((v1, v2) => {
						return new Date(v1.createdAt).getTime() - new Date(v2.createdAt).getTime()
					})
					// console.log(list.map(v=>v.content))
					this.history.loading = false;
					this.history.messages = list.concat(this.history.messages)
					if (this.history.messages.length >= res.data.total) {
						this.history.allLoaded = true
					} else {
						this.history.page++
					}
					if (scrollToBottom) {
						this.resetBottom()
					}
				}).catch((error) => {
					//获取失败
					console.log('获取历史消息失败:', error);
					uni.stopPullDownRefresh();
					this.history.loading = false;
				})
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
			// 好友操作
			openOptSelect() {
				uni.showActionSheet({
					itemList: this.selectList,
					success: async ({
						tapIndex
					}) => {
						const groupId = this.curOption.groupId
						if (tapIndex === 0 && groupId) {
							const res = await this.$api.del("/mobile/chat/groupMembers/{groupId}", {
								groupId: groupId
							})
							uni.showToast({
								title: res.msg,
							})
							uni.switchTab({
								url: "/pages/chat/index"
							})

						} else {
							const res = await this.$api.del("/mobile/chat/friends/{friendId}", {
								friendId: this.curOption.friendId
							})
							uni.showToast({
								title: res.msg,
							})
							uni.switchTab({
								url: "/pages/chat/index"
							})
						}
					},
					fail: function(res) {
						console.log(res.errMsg);
					}
				});

			},
		}
	}
</script>

<style lang="scss">
	/* #ifndef MP-WEIXIN */
	@font-face {
		font-family: 'emojifont';
		src: url("https://jiang-xia.top/x-blog/api/v1/static/uploads/2025-02/ae783d4e2fdd42a39f7e6d5042895b50-emojifont.ttf") format("truetype");
	}

	/* #endif */
	.container {
		padding: 20rpx 20rpx 140rpx 20rpx;
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
			margin: 0 20rpx;
			max-width: 520rpx;
		}

		.text-content {
			position: relative;
			min-width: 1em;
			padding: 16rpx 24rpx;
			border-radius: 12rpx;
			color: #000000;
			background: #FFFFFF;
			word-break: break-all;
			text-align: left;
			vertical-align: center;
			display: block;
			font-size: 28rpx;

			image {
				width: 50rpx;
				height: 50rpx;
			}

			&::before {
				content: " ";
				display: block;
				width: 0px;
				height: 0px;
				border-top: 8px solid transparent;
				border-bottom: 8px solid transparent;
				border-right: 8px solid #FFFFFF;
				position: absolute;
				top: 10px;
				left: -8px;
			}
		}

		.image-content {
			border-radius: 12rpx;

			image {
				border-radius: 12rpx;
				width: 300rpx;
				height: 180rpx;
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
			// box-shadow: inset 0 0 6rpx rgba(0, 0, 0, .12);
			color: #FFFFFF;

			&::before {
				left: auto;
				right: -8px !important;
				border-right-color: #0199fe;
				transform: rotateZ(180deg);
			}
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
		margin: 20rpx;
		margin-left: 0;
		border: none;
		outline: none;
		box-sizing: border-box;
		border-radius: 6px;
		background: #FFFFFF;
		font-size: 32rpx;
	}

	// 表情样式
	.emojifont {
		font-family: emojifont !important;
		font-style: normal;
	}

	.more {
		width: 62rpx;
		height: 62rpx;
		margin-right: 10rpx;
		display: flex;
	}

	.send-btn-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 110rpx;
		height: 60rpx;
		border-radius: 10rpx;
		background: $uni-color-primary;

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