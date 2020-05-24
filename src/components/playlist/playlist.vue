<template>
  <transition name="list-fade">
    <div class="playlist" v-show="hasShow" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i :class="iconMode" @click="changeMode"></i>
            <span class="text" v-text="getText()"></span>
            <span class="clear" @click="showConfirm"
              ><i class="icon-clear"></i
            ></span>
          </h1>
        </div>
        <scroll class="list-content" ref="listContentRef" :data="sequenceList" :refreshDelay="refreshDelay">
          <transition-group name="list" tag="ul">
            <!-- 提供唯一key值 -->
            <li
              class="item"
              v-for="(item, index) in sequenceList"
              :key="item.id"
              @click="selectItem(item, index)"
              ref="itemRef"
            >
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{ item.name }}</span>
              <span class="like" @click.stop="toggleFavorite(item)">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteItem(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="showAddSong">
            <i class="icon-add"></i>
            <span class="text">添加到歌曲队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm
        text="是否清空播放列表"
        btnRight="清空"
        ref="confirmRef"
        @confirm="clearList"
      ></confirm>
      <add-song ref="addSongRef"></add-song>
    </div>
  </transition>
</template>

<script>
import { mapActions } from 'vuex'
import Scroll from 'base/scroll/scroll'
import { playMode } from 'common/js/config.js'
import Confirm from 'base/confirm/confirm.vue'
import { playMixin } from 'common/js/mixins.js'
import AddSong from 'components/add-song/add-song.vue'

export default {
  mixins: [playMixin],
  data() {
    return {
      hasShow: false,
      refreshDelay: 100
    }
  },
  computed: {
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  },
  methods: {
    show() {
      this.hasShow = true
      // 延迟20ms
      setTimeout(() => {
        this.$refs.listContentRef.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    hide() {
      this.hasShow = false
    },
    getCurrentIcon(item) {
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      }
      return ''
    },
    selectItem(item, index) {
      if (this.mode === playMode.random) {
        index = this.playList.findIndex(song => {
          return song.id === item.id
        })
      }
      if (!item.url) {
        return
      }
      this.setCurrentIndex(index)
      this.setPlaying(true)
    },
    scrollToCurrent(current) {
      const index = this.sequenceList.findIndex(song => {
        return current.id === song.id
      })
      this.$refs.listContentRef.scrollToElement(this.$refs.itemRef[index], 300)
    },
    deleteItem(song) {
      this.deleteOne(song)
      if (this.playList.length < 1) {
        this.hide()
      }
    },
    showConfirm() {
      this.$refs.confirmRef.show()
    },
    clearList() {
      this.clearPlaylist()
      this.hide()
    },
    getText() {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.loop ? '单曲循环' : '随机播放'
    },
    showAddSong() {
      this.$refs.addSongRef.show()
    },
    ...mapActions(['deleteOne', 'clearPlaylist'])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!this.hasShow || newSong.id === oldSong.id) {
        return
      }
      this.scrollToCurrent(newSong)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/variable';
@import "../../common/stylus/mixin";

  .playlist
    position fixed
    top 0
    left 0
    bottom 0
    right 0
    z-index 200
    background-color $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition  all 0.3s
      .list-wrapper
        transition all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity 0
      .list-wrapper
        transform translate3d(0, 100%, 0)
    .list-wrapper
      position absolute
      left 0
      bottom 0
      width 100%
      background-color $color-highlight-background
      .list-header
        position relative
        padding 20px 30px 10px 20px
        .title
          display flex
          align-items center
          [class^="icon"]
            margin-right 10px
            font-size 30px
            color $color-theme-d
          .text
            flex 1
            font-size $font-size-medium
            color $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size $font-size-medium
              color $color-text-d
      .list-content
        max-height 240px
        overflow hidden
        .item
          display flex
          align-items center
          height 40px
          padding 0 30px 0 20px
          overflow hidden
          &.list-enter-active, &.list-leave-active
            transition all 0.1s linear
          &.list-enter, &.list-leave-to
            height 0
          .current
            flex 0 0 20px
            width 20px
            font-size $font-size-small
            color $color-theme-d
          .text
            flex 1
            no-wrap()
            font-size $font-size-medium
            color $color-text-d
          .like
            extend-click()
            margin-right 7px
            font-size $font-size-small
            color $color-theme
            .icon-favorite
              color $color-sub-theme
          .delete
            extend-click()
            font-size $font-size-small
            color $color-theme
      .list-operate
        width 140px
        margin 20px auto 30px auto
        .add
          display flex
          align-items center
          padding 8px 16px
          border 1px solid $color-text-l
          border-radius 100px
          color $color-text-l
          .icon-add
            margin-right 5px
            font-size $font-size-small-s
          .text
            font-size $font-size-small
      .list-close
        text-align center
        line-height 50px
        background-color $color-background
        font-size $font-size-medium-x
        color $color-text-l
</style>
