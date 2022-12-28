<template>
	<view class="container">
		
		<div class="history-wrap">
		</div>
		
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
				<input v-else v-model="text" class="consult-input" maxlength="700" placeholder="发送消息" type="text" />
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
			<view class="action-bottom action-bottom-emoji" v-if="emoji.visible">
				<image class="emoji-item" v-for="(emojiItem, emojiKey, index) in emoji.map" :key="index"
					:src="emoji.url + emojiItem" @click="chooseEmoji(emojiKey)"></image>
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
</template>

<script>
	import EmojiDecoder from '../../common/js/EmojiDecoder.js';
	import {
		baseUrl
	} from '../../common/request/api.js'
	export default {
		data() {
			const emojiUrl = 'https://imgcache.qq.com/open/qcloud/tim/assets/emoji/';
			const emojiMap = {
				'[么么哒]': 'emoji_3@2x.png',
				'[乒乓]': 'emoji_4@2x.png',
				'[便便]': 'emoji_5@2x.png',
				'[信封]': 'emoji_6@2x.png',
				'[偷笑]': 'emoji_7@2x.png',
				'[傲慢]': 'emoji_8@2x.png'
			};
			return {
				ws: '',
				//聊天文本框
				text: '',
				friend: null,
				to: {}, // 作为createMessage的参数
				currentUser: null,

				//定义表情列表
				emoji: {
					url: emojiUrl,
					map: emojiMap,
					visible: false,
					decoder: new EmojiDecoder(emojiUrl, emojiMap),
				},
				//是否展示‘其他消息类型面板’
				otherTypesMessagePanelVisible: false,
				history: {
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
				socketTask: null
			}
		},
		onLoad(option) {
			console.log(option)
			uni.setNavigationBarTitle({
				title: option.name
			})
		},
		onShow() {
			// const userId = getApp().globalData.userInfo.userId
			const userId = new Date().getTime();
			const url = 'ws://172.18.32.2:9600/api/v1/mobile/chat?userId=' + userId
			// const url = 'ws://172.18.32.2:9600/api/v1/mobile/chat'
			// const url = 'ws://192.168.1.51:9600/api/v1/mobile/chat'
			const token = uni.getStorageSync("token")
			this.socketTask = uni.connectSocket({
				url,
				// 自定义请求头(失败)
				// header: {
				// 		Authorization:token,
				// 	},
				method: 'GET',
				complete: () => {
					console.log('WebSocket已连接！');
				}
			});
			this.socketTask.onMessage((res) => {
				console.log('服务端消息：', res);
			});
			this.socketTask.onOpen((res) => {
				this.socketOpen = true;
				console.log('WebSocket连接已打开！');
			});
			this.socketTask.onError((res) => {
				console.log('WebSocket连接打开失败，请检查！');
			});
		},
		methods: {
			sendSocketMessage(msg) {
				if (this.socketOpen) {
					this.socketTask.send({
						data: msg,
						complete: () => {
							console.log('发送消息：', msg);
						}
					});
				} else {
					this.socketMsgQueue.push(msg);
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
					// this.ws.send(this.text)
					const sendObj = {
						cmd: "text",
						data: this.text
					}
					this.sendSocketMessage(JSON.stringify(sendObj));
				}
				this.text = '';
			},
			// 发送视频
			sendVideoMessage() {
				uni.chooseVideo({
					success: (res) => {
						console.log(res)
						this.sendSocketMessage(res.tempFile);
					}
				})
			},
			// 发送图片
			sendImageMessage() {
				uni.chooseImage({
					count: 9,
					success: (res) => {
						res.tempFiles.forEach(file => {
							console.log(file)
							this.sendSocketMessage(file);
							// let reader = new FileReader();
							// reader.readAsArrayBuffer(file)
							// reader.onload = (readRes)=>{
							//  console.log(readRes.target.result)
							//  const arrayBuffer = readRes.target.result
							//  this.sendSocketMessage(arrayBuffer);
							// }

							// reader.readAsDataURL(file)
							// reader.onload = (readRes) => {
							// 	const obj = {
							// 		cmd: "text",
							// 		data: readRes.target.result
							// 	}
							// 	this.sendSocketMessage(JSON.stringify(obj));
							// }
						})
					}
				});
			},


			/* 消息记录控制 操作*/
			// 加载历史消息
			loadHistoryMessage(scrollToBottom) { //历史消息
				this.history.loading = true;
				let lastMessageTimeStamp = null;
				let lastMessage = this.history.messages[0];
				if (lastMessage) {
					lastMessageTimeStamp = lastMessage.timestamp;
				}
			},
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 20rpx;
	}

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
		background: #D02129;

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
