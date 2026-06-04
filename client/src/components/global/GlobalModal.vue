<template>
  <t-dialog
    :visible="state.visible"
    :title="state.title"
    :content="state.content"
    :confirm-btn="state.confirmBtn"
    :cancel-btn="state.cancelBtn"
    :close-on-overlay-click="state.closeOnOverlayClick"
    @confirm="onConfirm"
    @cancel="onCancel"
    @close="onClose"
  />
</template>

<script>
export default {
  data() {
    return {
      state: {
        visible: false,
        title: '',
        content: '',
        closeOnOverlayClick: false,
        confirmBtn: {
          content: '确认',
          theme: 'primary',
        },
        cancelBtn: {
          content: '取消',
          theme: 'default',
        },
      },
      _resolver: null,
    }
  },
  methods: {
    open(options = {}) {
      const merged = {
        title: '',
        content: '',
        confirmText: '确认',
        cancelText: '取消',
        showCancel: true,
        closeOnClickOverlay: false,
        ...options,
      }

      if (this._resolver) {
        this._resolver({ confirm: false, cancel: true })
        this._resolver = null
      }

      this.state = {
        ...this.state,
        visible: true,
        title: String(merged.title || ''),
        content: String(merged.content || ''),
        closeOnOverlayClick: !!merged.closeOnClickOverlay,
        confirmBtn: {
          content: String(merged.confirmText || '确认'),
          theme: 'primary',
        },
        cancelBtn:
          merged.showCancel === false
            ? null
            : {
                content: String(merged.cancelText || '取消'),
                theme: 'default',
              },
      }

      return new Promise((resolve) => {
        this._resolver = resolve
      })
    },
    finish(result) {
      this.state = {
        ...this.state,
        visible: false,
      }
      if (this._resolver) {
        this._resolver(result)
        this._resolver = null
      }
    },
    onConfirm() {
      this.finish({ confirm: true, cancel: false })
    },
    onCancel() {
      this.finish({ confirm: false, cancel: true })
    },
    onClose() {
      this.finish({ confirm: false, cancel: true })
    },
  },
}
</script>
