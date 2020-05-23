<template>
  <transition name="drop">
    <div class="top-tip" v-show="hasFlag" @click.stop="hide">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    delay: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
      hasFlag: false
    }
  },
  methods: {
    show() {
      this.hasFlag = true
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delay)
    },
    hide() {
      this.hasFlag = false
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/variable';

.top-tip
  position fixed
  top 0
  width 100%
  z-index 500
  background-color $color-highlight-background
  &.drop-enter-active, &.drop-leave-active
    transition all 0.3s
  &.drop-enter, &.drop-leave-to
    transform translate3d(0, -100%, 0)
</style>
