<template>
	<pageConfig title="关于我们">
		<view class="about-page">
			<view class="brand">
				<image class="logo" src="/static/logo/android-chrome-192x192.png" mode="aspectFill" />
				<view class="name">{{ appName }}</view>
				<view class="slogan">{{ slogan }}</view>
			</view>

			<t-cell-group custom-style="margin:24rpx 0 0;">
				<t-cell title="版本号" :note="version" />
				<t-cell title="客服电话" :note="servicePhone" />
				<t-cell title="邮箱" :note="serviceEmail" />
				<t-cell title="服务协议" arrow @click="openLink('service')" />
				<t-cell title="隐私政策" arrow @click="openLink('privacy')" />
			</t-cell-group>

			<view class="desc">
				{{ desc }}
			</view>
		</view>
	</pageConfig>
</template>

<script>
	export default {
		data() {
			return {
				appName: 'ZONE',
				slogan: '便捷、安全的服务平台',
				desc: 'ZONE 致力于为用户提供更安全、更高效的使用体验，支持多种功能模块与便捷服务能力。',
				version: 'v1.0.0',
				servicePhone: '0000-10000',
				serviceEmail: 'service@zone.com',
			}
		},
		onLoad() {
			const normalized = (v) => {
				if (!v) return ''
				const s = String(v).trim()
				if (!s) return ''
				return s.startsWith('v') || s.startsWith('V') ? `v${s.slice(1)}` : `v${s}`
			}

			// #ifdef APP-PLUS
			try {
				this.version = normalized(plus?.runtime?.version) || this.version
			} catch (e) {}
			// #endif

			// #ifndef APP-PLUS
			try {
				const account = uni.getAccountInfoSync?.()
				const mpv = account?.miniProgram?.version
				this.version = normalized(mpv) || this.version
			} catch (e) {}
			// #endif
		},
		methods: {
			openLink(type) {
				// 这里沿用项目里现有的 pdf 打开方式（$common.openPdf）
				// 若后续有后端配置地址，可把这里替换成接口/配置读取
				const base = 'https://admin.jiang-xia.top/test-front/files/'
				const url =
					type === 'service'
						? `${base}user_service_agreement.pdf`
						: `${base}privacy_policy_user_agreement.pdf`

				if (!url) {
					uni.showToast({
						title: '协议文件未配置',
						icon: 'none',
					})
					return
				}
				this.$common.openPdf(url)
			},
		},
	}
</script>

<style lang="scss">
	.about-page {
		margin-top: 24rpx;
		height: 100%;
		box-sizing: border-box;
		background: #fff;
	}

	.brand {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 32rpx 0 16rpx;
	}

	.logo {
		width: 120rpx;
		height: 120rpx;
		border-radius: 24rpx;
		background: #fff;
		margin-bottom: 16rpx;
	}

	.name {
		font-size: 34rpx;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.88);
	}

	.slogan {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: rgba(0, 0, 0, 0.45);
	}

	.desc {
		margin-top: 24rpx;
		font-size: 24rpx;
		color: rgba(0, 0, 0, 0.5);
		line-height: 1.6;
		padding: 0 32rpx 32rpx;
	}
</style>

