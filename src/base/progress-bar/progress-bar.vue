<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div
        class="progress-btn-wrapper"
        ref="progressBtn"
        @touchstart.prevent="touchStart"
        @touchmove.prevent="touchMove"
        @touchend="touchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { prefixStyle } from 'common/js/dom.js'

const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  props: {
    precent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    precent(newPrecent) {
      if (this.touch.initiated) {
        return
      }
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const offsetWidth = newPrecent * barWidth
      this._offset(offsetWidth)
    }
  },
  created() {
    this.touch = {}
  },
  methods: {
    touchStart(e) {
      this.touch.initiated = true
      // 手指起始位置
      this.touch.startX = e.touches[0].pageX
      // 进度条偏移大小
      this.touch.left = this.$refs.progress.clientWidth
    },
    touchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      // 手指移动的偏移量
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 进度条偏移量
      const offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.$refs.progressBar.clientWidth - progressBtnWidth
      )
      this._offset(offsetWidth)
    },
    touchEnd() {
      this.touch.initiated = false
      this._triggerPrecent()
    },
    progressClick(e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // this._offset(e.offsetX)
      this._triggerPrecent()
    },
    _triggerPrecent() {
      // 进度条长度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      // 进度条偏移度/进度条长度
      const precent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', precent)
    },
    _offset(offsetWidth) {
      this.$refs.progress.style.width = offsetWidth + 'px'
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable";

.progress-bar
  height 30px
  .bar-inner
    position relative
    top 13px
    height 4px
    background-color rgba(0, 0, 0, 0.3)
    .progress
      position absolute
      height 100%
      background-color $color-theme
    .progress-btn-wrapper
      position absolute
      left -8px
      top -13px
      width 30px
      height 30px
      .progress-btn
        position relative
        top 7px
        left 7px
        box-sizing border-box
        width 16px
        height 16px
        border 3px solid $color-text
        border-radius 50%
        background-color $color-theme
</style>
