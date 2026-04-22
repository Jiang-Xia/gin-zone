<template>
  <pageConfig title="群聊管理">
    <view class="container">
      <uni-section title="我创建的群聊" type="line">
        <view v-if="loading" class="tip">加载中...</view>
        <view v-else-if="!groups.length" class="tip">暂无可管理的群聊</view>
        <t-cell-group v-else>
          <t-cell
            v-for="g in groups"
            :key="g.id"
            :title="g.groupName"
            :note="`群ID：${g.id}`"
            :bordered="true"
            arrow
            @click="goEdit(g)"
          >
            <template #image>
              <t-image shape="circle" width="40px" height="40px" :src="g.avatar || groupIcon" />
            </template>
            <template #right-icon>
              <t-button size="small" theme="primary" variant="text" @click.stop="goMembers(g)">
                成员
              </t-button>
            </template>
          </t-cell>
        </t-cell-group>
      </uni-section>
    </view>
  </pageConfig>
</template>

<script>
  export default {
    data() {
      return {
        groupIcon: this.$getImg('/static/images/group.png'),
        loading: false,
        groups: [],
      }
    },
    onShow() {
      this.init()
    },
    methods: {
      async init() {
        this.loading = true
        try {
          const res = await this.$apis.chat.groups({})
          this.groups = res?.data || []
        } catch (e) {
          this.groups = []
        } finally {
          this.loading = false
        }
      },
      goMembers(g) {
        if (!g?.id) return
        // 中文注释：群成员管理单独页面（支持删除成员）
        uni.navigateTo({
          url: `/packageA/pages/my/groupMembers?groupId=${g.id}`,
        })
      },
      goEdit(g) {
        if (!g?.id) return
        // 中文注释：复用 createGroup 页面做编辑模式
        uni.navigateTo({
          url: `/packageA/pages/my/createGroup?groupId=${g.id}`,
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .container {
    margin-top: 16rpx;
  }
  .tip {
    text-align: center;
    color: #999;
    font-size: 12px;
    padding: 40rpx 20rpx;
  }
</style>

