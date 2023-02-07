<template>
	<view class="container moment-card-wrap">
		<uni-nav-bar backgroundColor="#f8f8f8" left-icon="plus" border fixed statusBar title="动态"
			@clickLeft="clickLeft" />
		<section class="moment-card" v-for="(item, index) in cardList" :key="index">
			<div class="card-top">
				<image class="avatar" :src="item.userInfo.avatar" />
				<div class="middle">
					<p class="name">{{ item.userInfo.nickName }}</p>
					<p class="date">{{ item.date }}</p>
				</div>

			</div>
			<div class="card-message">{{ item.content }}</div>
			<div class="card-images">
				<image class="image-item" v-for="(item2, index2) in item.images"
					:style="{ marginRight: (index2 + 1) % 3 === 0 ? '0px' : '4px' }" width="114" height="114" radius="8"
					:src="$fileUrl+item2" :key="index2" />
			</div>
			<div class="card-bottom">
				<div class="adress">
					<uni-icons type="location" color="#999"></uni-icons> {{ item.location }}
					<uni-icons type="right" color="#999"></uni-icons>
				</div>
				<div class="tool-wrap">
					<span @click="dianzanHandle(item)">
						<uni-icons :type="item.dianzaned ? 'hand-up-filled' : 'hand-up'" style="margin-bottom: 4px;"
							:color="item.dianzaned ? '#0066cc' : '#666'"></uni-icons>
						<span :style="{ color: item.dianzaned ? '#0066cc' : '' }">{{ item.likes }}</span>
					</span>
					<span>
						<uni-icons type="chatbubble" color="#666"></uni-icons>
						{{ item.likes }}
					</span>
					<span>
						<uni-icons type="eye" color="#666"></uni-icons>
						{{ item.views }}
					</span>
					<span>
						<uni-icons type="ellipsis" color="#666"></uni-icons>
					</span>
				</div>
			</div>
		</section>
		<uni-load-more v-if="loading || status === 'noMore' " :status="status" />
	</view>
</template>

<script>
	import { formatDate } from '../../common/utils/util'
import {
		formatTime
	} from '/common/utils/util'
	const cardList2 = [{
			avatar: 'https://img1.baidu.com/it/u=281986597,1107643953&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
			name: '樱桃',
			gender: 2,
			age: 25,
			message: '我想和你走在夕阳里，看大街小巷，不着急回家，就漫无目的地溜达。',
			distance: '7km',
			date: '2022-11-21 12:20:23',
			images: [
				'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F8%2F5453005f74be2.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1674612699&t=c255de55c9482b1be637b6a6df87fd8f',
				'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202003%2F16%2F20200316081738_wxfdu.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1674702710&t=eeda2d74be0bdbf338a369668fa139dd',
				'https://www.chinachaxun.com/img/20210916/1798480237'
			],
			adress: '广州市车陂街道128号',
			dianzaned: false,
			dianzan: 1980,
			pinlun: 1823,
			liulan: 3356
		},
		{
			avatar: 'https://img1.baidu.com/it/u=281986597,1107643953&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
			name: '夏天',
			gender: 2,
			age: 27,
			message: '爱是一种遇见，不能等待，也不能准备。。',
			distance: '13km',
			date: '2022-11-21 12:20:23',
			adress: '广州市车陂街道128号',
			dianzaned: false,
			dianzan: 1980,
			pinlun: 1823,
			liulan: 3356,
			images: [
				'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F8%2F5453005f74be2.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1674612699&t=c255de55c9482b1be637b6a6df87fd8f'
			]
		},
		{
			avatar: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202108%2F07%2F20210807103322_cfa78.thumb.1000_0.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1674293212&t=47f0a9282ddfc15afa88b86552fc0608',
			name: '由南向北',
			gender: 1,
			age: 30,
			message: '你可以把余生交给我保管，可以霸占我情话里的每一句喜欢。',
			distance: '22km',
			date: '2022-11-21 12:20:23',
			adress: '广州市车陂街道128号',
			dianzaned: false,
			dianzan: 1980,
			pinlun: 1823,
			liulan: 3356,
			images: [
				'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F8%2F5453005f74be2.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1674612699&t=c255de55c9482b1be637b6a6df87fd8f'
			]
		},
		{
			avatar: 'https://img1.baidu.com/it/u=281986597,1107643953&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
			name: '栗子',
			gender: 2,
			age: 29,
			message: '愿陪你三世：一世枕边书，一世怀中猫，一世意中人。',
			distance: '29km',
			date: '2022-11-21 12:20:23',
			adress: '广州市车陂街道128号',
			dianzan: 1980,
			dianzaned: false,
			pinlun: 1823,
			liulan: 3356,
			images: [
				'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F8%2F5453005f74be2.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1674612699&t=c255de55c9482b1be637b6a6df87fd8f'
			]
		}
	]
	export default {
		data() {
			return {
				cardList: [],
				loading: false,
				status: "more",
				page: 1,
			}
		},
		// 下拉刷新回调函数
		onPullDownRefresh() {
			this.init()
			uni.stopPullDownRefresh()
		},
		onShow(){
			this.init()
		},
		// 上拉加载回调函数
		onReachBottom() {
			this.getMomentList(true)
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
					try{
						this.loading = true
						this.status = "loading"
						// 是否滚动
						if (!isScoll) {
							this.articleList = []
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
						const res = await this.$api.get('/mobile/moments', params)
						const list = res.data.list.map(v=>{
							v.images = v.urls.split()
							v.date = formatDate(v.createdAt)
							return v
						})
						if (!list.length) {
							this.status = "noMore"
						} else {
							this.status = "more"
						}
						this.loading = false
						this.cardList = this.cardList.concat(list)
					}catch(e){
						this.loading = false
					}
			},
			dianzanHandle(item) {
				item.dianzaned = true
			},
			clickLeft() {
				if (!this.$common.getUserId()) {
					this.$common.showLoginModal()
					return
				}
				uni.navigateTo({
					url: "/pages/moment/addMoment"
				})
			}
		}
	}
</script>

<style lang="scss">
	.moment-card-wrap {
		.moment-card {
			padding: 12px 12px 12px 12px;
			margin-bottom: 12px;
			border-bottom: 1rpx solid $uni-border-1;
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
			font-weight: 500;
			color: #000000;
			margin-bottom: 10px;
		}

		.card-images {
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

				&>span {
					// display: flex;
					// align-items: center;
				}

				.uni-icon {
					// margin-right: 2px;
				}
			}
		}
	}
</style>
