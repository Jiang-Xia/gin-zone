<template>
    <pageConfig title="动态" :left="false">
        <view class="container moment-card-wrap">
        	<section class="moment-card" v-for="(item, index) in cardList" :key="item.id || index">
        		<div class="card-top">
        			<image class="avatar" :src="item.userInfo.avatar" />
        			<div class="middle">
        				<p class="name">{{ item.userInfo.nickName }}</p>
        				<p class="date">{{ item.date }}</p>
        			</div>
        
        		</div>
        		<div class="card-message">{{ item.content }}</div>
        		<div class="card-images">
        			<!-- <image class="image-item" v-for="(item2, index2) in item.images"
        				:style="{ marginRight: (index2 + 1) % 3 === 0 ? '0px' : '4px' }" width="114" height="114" radius="8"
        				:src="$fileUrl+item2" :key="item2+index2" @click="previewImage(item)" /> -->
                    <t-image t-class="image-item" v-for="(item2, index2) in item.images"
                        :style="{ marginRight: (index2 + 1) % 3 === 0 ? '0px' : '4px' }" mode="aspectFill" width="114px" height="114px"
                        :custom-style="{ width: '114px', height: '114px', borderRadius: '8px', overflow: 'hidden' }" :src="$fileUrl+item2" :key="item2+index2"
                        @click="previewImage(item)" />
        		</div>
        		<div class="card-bottom">
        			<div class="adress">
        				<uni-icons type="location" color="#999"></uni-icons> {{ item.location }}
        				<uni-icons type="right" color="#999"></uni-icons>
        			</div>
        			<div class="tool-wrap">
        				<view @click="dianzanHandle(item)">
        					<uni-icons :type="item.dianzaned ? 'hand-up-filled' : 'hand-up'" style="margin-bottom: 4px;"
        						:color="item.dianzaned ? '#0066cc' : '#666'"></uni-icons>
        					<text :style="{ color: item.dianzaned ? '#0066cc' : '' }">{{ item.likes }}</text>
        				</view>
        				<view @click="openCommentFromIcon(item)">
        					<uni-icons type="chatbubble" color="#666"></uni-icons>
        					{{ item.commentCount || 0 }}
        				</view>
        				<view>
        					<uni-icons type="eye" color="#666"></uni-icons>
        					{{ item.views }}
        				</view>
        			</div>
                    <div class="comment-wrap">
                        <div
                            v-if="(item.commentCount || 0) > 0 || item._showComments"
                            class="comment-action"
                            @click="toggleComment(item)"
                        >
                            {{ getCommentActionText(item) }}
                        </div>
                        <div v-if="item._showComments" class="comment-panel wx-comment-panel" @click="onCommentPanelClick(item)">
                            <div v-if="item._commentsLoading" class="comment-empty">评论加载中...</div>
                            <div v-else-if="!(item._comments || []).length" class="comment-empty">暂无评论</div>
                            <div v-else class="comment-list wx-comment-list">
                                <div class="comment-root" v-for="root in getVisibleRootComments(item)" :key="root.id">
                                    <div
                                        class="comment-item"
                                        @click.stop="setReplyTarget(item, root)"
                                        @longpress="onCommentLongPress(item, root)"
                                    >
                                        <div class="comment-content">
                                            <text class="comment-name">{{ getCommentUserName(root) }}</text>
                                            <text class="comment-colon">：</text>
                                            <text class="comment-text">{{ root.content }}</text>
                                        </div>
                                        <div v-if="formatCommentTime(root.createdAt)" class="comment-meta">
                                            <text class="comment-time">{{ formatCommentTime(root.createdAt) }}</text>
                                        </div>
                                    </div>
                                    <div v-if="(root.children || []).length" class="comment-children">
                                        <div
                                            class="comment-item reply-item"
                                            v-for="child in root.children"
                                            :key="child.id"
                                            @click.stop="setReplyTarget(item, child)"
                                            @longpress="onCommentLongPress(item, child)"
                                        >
                                            <div class="comment-content">
                                                <text class="comment-name">{{ getCommentUserName(child) }}</text>
                                                <text v-if="getReplyToName(child)" class="comment-reply-user">
                                                    回复 {{ getReplyToName(child) }}
                                                </text>
                                                <text class="comment-colon">：</text>
                                                <text class="comment-text">{{ child.content }}</text>
                                            </div>
                                            <div v-if="formatCommentTime(child.createdAt)" class="comment-meta">
                                                <text class="comment-time">{{ formatCommentTime(child.createdAt) }}</text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    v-if="!item._commentExpanded && (item.commentCount || 0) > commentPreviewCount"
                                    class="comment-more"
                                    @click.stop="expandAllComments(item)"
                                >
                                    展示全部评论({{ (item._comments || []).length }})
                                </div>
                            </div>
                            <div v-if="item.allowComment && item._showCommentInput" class="comment-input-row">
                                <text
                                    v-if="item._replyTarget"
                                    class="reply-indicator"
                                    @click.stop="clearReplyTarget(item)"
                                >
                                    回复 {{ getCommentUserName(item._replyTarget) }}（点击取消）
                                </text>
                                <input
                                    class="comment-input"
                                    v-model="item._draftComment"
                                    :placeholder="item._replyTarget ? `回复 ${item._replyTarget.userInfo?.nickName || ''}` : '说点什么...'"
                                    :focus="Boolean(item._autoFocus)"
                                    @click.stop
                                />
                                <t-button size="small" theme="primary" @click.stop="submitComment(item)">发送</t-button>
                            </div>
                        </div>
                    </div>
        		</div>
        	</section>
        	<uni-load-more v-if="loading || status === 'noMore' " :status="status" />
            <!-- #ifndef APP -->
            <uni-fab :pattern="{buttonColor: '#f00057'}" @fabClick="clickLeft()" :pop-menu="false" horizontal="right" vertical="bottom"></uni-fab>
            <!-- #endif -->
        </view>
        <!-- <tabbar :tabBarShow="1"/> -->
    </pageConfig>
</template>

<script>
	import {
		formatDate
	} from '../../common/utils/util'
	import {
		formatTime
	} from '@/common/utils/util'
	export default {
		data() {
			return {
				cardList: [],
				loading: false,
				status: "more",
				page: 1,
                // 评论默认预览条数，避免动态卡片过长
                commentPreviewCount: 3,
			}
		},
		// 下拉刷新回调函数
		onPullDownRefresh() {
			this.init()
		},
		onShow() {
			this.init()
		},
        onReady() {
        },
		// 上拉加载回调函数
		onReachBottom() {
			this.getMomentList(true)
		},
		onNavigationBarButtonTap() {
			this.clickLeft()
		},
		// created() {
		// 	this.init()
		// },
		methods: {
			init() {
				this.cardList = []
				this.onSearch()
			},
			onSearch() {
				this.getMomentList()
			},
			async getMomentList(isScoll) {
				try {
					this.loading = true
					this.status = "loading"
					// 是否滚动
					if (!isScoll) {
						this.cardList = []
						this.page = 1
					} else {
						this.page++
					}
					const {
						content
					} = this
					const params = {
						page: this.page,
						pageSize: 20,
					}
					// 动态列表：走接口层统一入口
					const res = await this.$apis.moment.list(params)
					const list = (res?.data?.list || []).map(v => {
						v.images = v.urls.split(',')
						v.date = formatDate(v.createdAt)
                        // 评论区本地态，避免污染后端结构字段
                        // 动态列表默认展示 3 条评论预览（由后端 commentPreview 提供）
                        v._showComments = Array.isArray(v.commentPreview) && v.commentPreview.length > 0
                        v._commentsLoading = false
                        v._comments = Array.isArray(v.commentPreview) ? v.commentPreview : []
                        v._draftComment = ''
                        v._replyTarget = null
                        v._commentExpanded = false
                        // 输入框默认隐藏，避免列表首屏过于拥挤
                        v._showCommentInput = false
                        // 自动聚焦标记：只在打开输入框时触发一次
                        v._autoFocus = false
                        // 评论树：把回复挂载到一级评论下面（更像微信展示）
                        v._commentTree = this.buildCommentTree(v._comments)
                        // 标记当前评论列表是否为“已加载全量”
                        v._hasFullComments = false
						return v
					})
					if (!list.length) {
						this.status = "noMore"
					} else {
						this.status = "more"
					}
					this.loading = false
					this.cardList = this.cardList.concat(list)
				} catch (e) {
					// 注释：网络/鉴权失败等情况给出明确提示
					uni.showToast({
						title: (e && e.msg) ? e.msg : '加载失败，请稍后重试',
						icon: "none"
					})
				} finally {
					this.loading = false
					uni.stopPullDownRefresh()
				}
			},
			dianzanHandle(item) {
				if (item.dianzaned) return
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
					return
				}
				item.dianzaned = true
				this.optHandle(item,'like')
			},
			clickLeft() {
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
					return
				}
				uni.navigateTo({
					url: "/packageA/pages/moment/addMoment"
				})
			},
			// 查看动态图片
			previewImage(item) {
				// 浏览也要求登录（与后端鉴权保持一致）
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
					return
				}
				this.optHandle(item,'view')
				uni.previewImage({
					loop: true,
					indicator: "number",
					longPressActions: true,
					urls: item.images.map(v => this.$fileUrl + v)
				})
			},
			// 更新动态数据
			async optHandle(item, type) {
				// 注释：乐观更新 + 失败回滚，避免接口失败导致本地数据漂移
				const prevLikes = item.likes
				const prevViews = item.views
				if (type === 'like') item.likes++
				if (type === 'view') item.views++
				try {
					await this.$apis.moment.update({
						id: item.id,
						t: type
					})
				} catch (e) {
					item.likes = prevLikes
					item.views = prevViews
					if (type === 'like') item.dianzaned = false
					uni.showToast({
						title: (e && e.msg) ? e.msg : '操作失败，请稍后重试',
						icon: "none"
					})
				}
			},
            // 展开评论区并加载评论
            async toggleComment(item) {
                if (!item._showComments) {
                    item._showComments = true
                    // 从“收起”恢复时，优先沿用已有数据；没有数据再拉取
                    if (!(item._comments || []).length) {
                        await this.loadComments(item)
                    }
                    return
                }
                // “收起评论”按钮独立：只负责收起评论区
                item._showComments = false
            },
            async loadComments(item) {
                item._commentsLoading = true
                try {
                    const res = await this.$apis.moment.comments(item.id)
                    item._comments = res?.data || []
                    item._commentTree = this.buildCommentTree(item._comments)
                    item._commentExpanded = false
                    item._hasFullComments = true
                } catch (e) {
                    uni.showToast({
                        title: (e && e.msg) ? e.msg : '评论加载失败',
                        icon: "none"
                    })
                } finally {
                    item._commentsLoading = false
                }
            },
            // 选择被回复评论（replyTarget 只用于提交 parentId）
            setReplyTarget(item, comment) {
                if (!item.allowReply) return
                item._showCommentInput = true
                item._replyTarget = comment
                // 注释：进入回复态时自动聚焦输入框
                item._autoFocus = true
                this.$nextTick(() => {
                    item._autoFocus = false
                })
            },
            // 主动打开评论输入框（普通评论）
            openCommentInput(item) {
                item._showCommentInput = true
            },
            // 点击动态“评论图标”：打开评论区并展示输入框
            openCommentFromIcon(item) {
                if (!this.$common.getUserId()) {
                    this.$common.showLoginModal()
                    return
                }
                item._showComments = true
                item._showCommentInput = true
                // 注释：打开输入框时触发一次自动聚焦，提升“写评论”手感
                item._autoFocus = true
                this.$nextTick(() => {
                    item._autoFocus = false
                })
                // 如果当前只有预览评论且存在更多，用户往往期望直接看到全量；这里不强制拉取，避免频繁请求
            },
            // 点击评论面板空白处时，退出回复态（更贴近微信交互）
            onCommentPanelClick(item) {
                if (!item._replyTarget) return
                item._replyTarget = null
                item._draftComment = ''
                item._showCommentInput = false
            },
            // 取消当前回复目标，恢复普通评论输入状态
            clearReplyTarget(item) {
                item._replyTarget = null
                item._draftComment = ''
                item._showCommentInput = false
            },
            // 长按评论/回复：仅自己的评论或自己的回复可删除
            onCommentLongPress(item, comment) {
                if (!this.$common.getUserId()) {
                    this.$common.showLoginModal()
                    return
                }
                const currentUid = String(this.$common.getUserId() || '')
                const isOwnerComment = String(comment.userId || '') === currentUid
                // 长按菜单：所有评论都可复制，自己的评论可额外删除
                const itemList = isOwnerComment ? ['复制评论', '删除评论'] : ['复制评论']
                uni.showActionSheet({
                    itemList,
                    success: async (res) => {
                        if (res.tapIndex === 0) {
                            this.copyComment(comment)
                            return
                        }
                        if (isOwnerComment && res.tapIndex === 1) {
                            await this.deleteComment(item, comment)
                        }
                    }
                })
            },
            // 复制评论文案（含“回复关系”上下文）
            copyComment(comment) {
                const fromName = this.getCommentUserName(comment)
                const toName = comment.parentId > 0 ? this.getReplyToName(comment) : ''
                const text = toName ? `${fromName} 回复 ${toName}：${comment.content || ''}` : `${fromName}：${comment.content || ''}`
                uni.setClipboardData({
                    data: text,
                    success: () => uni.showToast({ title: '已复制', icon: 'none' }),
                })
            },
            async deleteComment(item, comment) {
                try {
                    await this.$apis.moment.deleteComment(item.id, comment.id)
                    item.commentCount = Math.max((item.commentCount || 1) - 1, 0)
                    await this.loadComments(item)
                    uni.showToast({ title: '删除成功', icon: 'none' })
                } catch (e) {
                    uni.showToast({
                        title: (e && e.msg) ? e.msg : '删除失败',
                        icon: 'none'
                    })
                }
            },
            // 评论人昵称展示（优先 nickName，兜底 userId）
            getCommentUserName(comment) {
                const currentUid = String(this.$common.getUserId() || '')
                if (String(comment?.userId || '') === currentUid) return '我'
                return comment?.userInfo?.nickName || comment?.userId || '匿名用户'
            },
            // 被回复人昵称展示（优先 replyToUserInfo，兜底 replyToUserId）
            getReplyToName(comment) {
                const currentUid = String(this.$common.getUserId() || '')
                if (String(comment?.replyToUserId || '') === currentUid) return '我'
                return comment?.replyToUserInfo?.nickName || comment?.replyToUserId || ''
            },
            // 评论时间弱化展示：刚刚/xx分钟前/xx小时前/日期
            formatCommentTime(value) {
                if (!value) return ''
                const date = new Date(value)
                if (Number.isNaN(date.getTime())) return ''
                const diffMs = Date.now() - date.getTime()
                const minute = 60 * 1000
                const hour = 60 * minute
                const day = 24 * hour
                if (diffMs < minute) return '刚刚'
                if (diffMs < hour) return `${Math.floor(diffMs / minute)}分钟前`
                if (diffMs < day) return `${Math.floor(diffMs / hour)}小时前`
                const month = `${date.getMonth() + 1}`.padStart(2, '0')
                const dayText = `${date.getDate()}`.padStart(2, '0')
                return `${month}-${dayText}`
            },
            // 评论区默认仅展示前 N 条，展开后显示全部
            getVisibleRootComments(item) {
                const roots = (item && item._commentTree) ? item._commentTree : []
                if (item?._commentExpanded) return roots
                const start = Math.max(roots.length - this.commentPreviewCount, 0)
                return roots.slice(start)
            },
            // 把平铺评论转换为“一级评论 + 其下回复”结构
            buildCommentTree(comments) {
                const list = Array.isArray(comments) ? comments : []
                const byId = new Map()
                list.forEach((c) => {
                    byId.set(c.id, { ...c, children: [] })
                })
                const roots = []
                byId.forEach((node) => {
                    const parentId = Number(node.parentId || 0)
                    if (!parentId) {
                        roots.push(node)
                        return
                    }
                    // 回复可能回复的是“回复”，这里将其归属到顶层评论下展示
                    let parent = byId.get(parentId)
                    while (parent && Number(parent.parentId || 0)) {
                        parent = byId.get(Number(parent.parentId || 0))
                    }
                    if (parent) {
                        parent.children.push(node)
                    } else {
                        roots.push(node)
                    }
                })
                // 排序：一级评论按时间升序；回复按时间升序
                const toTime = (v) => new Date(v?.createdAt || 0).getTime() || 0
                roots.sort((a, b) => toTime(a) - toTime(b))
                roots.forEach((r) => r.children.sort((a, b) => toTime(a) - toTime(b)))
                return roots
            },
            // “展示全部评论”按钮独立：只负责展开全量评论
            async expandAllComments(item) {
                if (!item._hasFullComments) {
                    await this.loadComments(item)
                }
                item._commentExpanded = true
            },
            // 评论区主按钮文案：与“展示全部评论”按钮独立（无评论时不显示该按钮）
            getCommentActionText(item) {
                if (!item?._showComments) return '查看评论'
                return '收起评论'
            },
            async submitComment(item) {
                if (!this.$common.getUserId()) {
                    this.$common.showLoginModal()
                    return
                }
                const content = (item._draftComment || '').trim()
                if (!content) {
                    uni.showToast({ title: '请输入评论内容', icon: 'none' })
                    return
                }
                try {
                    await this.$apis.moment.createComment(item.id, {
                        content,
                        parentId: item._replyTarget ? item._replyTarget.id : 0,
                    })
                    item._draftComment = ''
                    item._replyTarget = null
                    item._showCommentInput = false
                    item.commentCount = (item.commentCount || 0) + 1
                    item._showComments = true
                    await this.loadComments(item)
                } catch (e) {
                    uni.showToast({
                        title: (e && e.msg) ? e.msg : '发送失败',
                        icon: 'none'
                    })
                }
            }
		}
	}
</script>

<style lang="scss">
	.moment-card-wrap {
        padding-bottom: 50px;
        // padding-right: 24rpx;
        // padding-left: 24rpx;
        padding-top: 16rpx;
		.moment-card {
			padding: 24rpx 32rpx;
			margin-bottom: 16rpx;
			// border-bottom: 1rpx solid $uni-border-1;
            background-color: $uni-white;
            // border-radius: 16rpx;
		}

		.card-top {
			display: flex;

			.middle {
				flex: 1;
			}

			.avatar {
				margin-right: 12px;
				height: 80rpx;
				width: 80rpx;
				border-radius: 50%;
                background-color: #f5f5f5;
			}

			.name {
				color: #666;
				padding-bottom: 8px;
				font-size: 15px;
			}

			.date {
				color: #999;
				font-size: 13px;
			}
		}

		.card-message {
			margin-top: 10px;
			font-size: 15px;
			color: #333;
			margin-bottom: 10px;
		}

		.card-images {
            display: flex;
            flex-wrap: wrap;
			.image-item {
				height: 228rpx;
				width: 228rpx;
				border-radius: 16rpx;
				margin-right: 4px;
				margin-bottom: 4px;
			}
		}

		.card-bottom {
			padding-top: 10px;

			.adress {
				color: #999;
				font-size: 13px;

				.uni-icon {
					font-size: 14px;
					vertical-align: middle;
				}
			}

			.tool-wrap {
				padding-top: 18px;
				display: flex;
				justify-content: space-between;
				color: #666;
				font-size: 13px;
				font-weight: 500;
				color: #666666;
				line-height: 12px;

				&>text {
					// display: flex;
					// align-items: center;
				}

				.uni-icon {
					// margin-right: 2px;
				}
			}
		}
        .comment-wrap {
            margin-top: 12rpx;
            .comment-action {
                display: inline-flex;
                align-items: center;
                color: #5b6f94;
                font-size: 22rpx;
                padding: 4rpx 0;
            }
            .comment-panel {
                margin-top: 8rpx;
                border-radius: 8rpx;
                padding: 12rpx 14rpx;
            }
            .wx-comment-panel {
                // 模拟朋友圈评论区浅灰底
                position: relative;
                background: #f3f3f3;
                border-radius: 12rpx;
            }
            .wx-comment-panel::before {
                // 顶部小三角，增强“气泡感”
                content: '';
                position: absolute;
                top: -10rpx;
                left: 26rpx;
                width: 0;
                height: 0;
                border-left: 10rpx solid transparent;
                border-right: 10rpx solid transparent;
                border-bottom: 10rpx solid #f3f3f3;
            }
            .comment-empty {
                color: #999;
                font-size: 24rpx;
            }
            .wx-comment-list {
                .comment-root + .comment-root {
                    padding-top: 4rpx;
                    margin-top: 4rpx;
                }
            }
            .comment-item {
                padding: 1rpx 0;
                cursor: pointer;
            }
            .reply-item {
                padding-left: 18rpx;
            }
            .comment-children {
                margin-top: 0;
            }
            .comment-name,
            .comment-reply-user {
                color: #576b95;
                font-weight: 400;
            }
            .comment-reply-user {
                margin-left: 6rpx;
            }
            .comment-colon {
                color: #2f2f2f;
            }
            .comment-content {
                display: flex;
                flex-wrap: wrap;
                align-items: baseline;
                color: #2f2f2f;
                line-height: 1.38;
                word-break: break-word;
                font-size: 24rpx;
            }
            .comment-children .comment-content {
                font-size: 22rpx;
            }
            .comment-text {
                margin-left: 2rpx;
                white-space: pre-wrap;
            }
            .comment-meta {
                margin-top: 0;
                display: flex;
                justify-content: flex-end;
                line-height: 1.1;
            }
            .comment-time {
                color: #9b9b9b;
                font-size: 19rpx;
                white-space: nowrap;
            }
            .comment-more {
                margin-top: 6rpx;
                color: #576b95;
                font-size: 21rpx;
            }
            .comment-input-row {
                margin-top: 10rpx;
                display: flex;
                flex-wrap: wrap;
                gap: 6rpx;
                align-items: center;
                padding-top: 6rpx;
                border-top: 1px solid #e6e6e6;
            }
            .reply-indicator {
                width: 100%;
                font-size: 20rpx;
                color: #576b95;
                background: #e9edf5;
                border-radius: 6rpx;
                padding: 4rpx 8rpx;
            }
            .comment-input {
                flex: 1;
                height: 60rpx;
                padding: 0 16rpx;
                background: #fff;
                border-radius: 999px;
                font-size: 24rpx;
                color: #2f2f2f;
            }
            .comment-entry {
                margin-top: 8rpx;
                color: #576b95;
                font-size: 21rpx;
            }
        }
	}
</style>
