<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
      </div>
      <div class="play-btn" ref="playBtn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapperRef">
        <scroll class="list-scroll" ref="songListRef" :data="favoriteList" v-if="currentIndex === 0">
            <div class="list-inner">
              <song-list :songs="favoriteList" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll class="list-scroll" ref="searchListRef" :data="searchHistory" v-if="currentIndex === 1">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script>
import Switches from 'base/switches/switches.vue'
import Scroll from 'base/scroll/scroll.vue'
import SongList from 'base/song-list/song-list.vue'
import Song from 'common/js/song.js'
import { mapGetters, mapActions } from 'vuex'
import { playListMixin } from 'common/js/mixins.js'
import NoResult from 'base/no-result/no-result.vue'

export default {
  mixins: [playListMixin],
  data() {
    return {
      currentIndex: 0,
      switches: [{ name: '我喜欢的' }, { name: '最近播放' }]
    }
  },
  computed: {
    noResult() {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else {
        return !this.playHistory
      }
    },
    noResultDesc() {
      if (this.currentIndex === 0) {
        return '无收藏歌曲'
      } else {
        return '无最近播放歌曲'
      }
    },
    ...mapGetters(['favoriteList', 'playHistory', 'searchHistory'])
  },
  components: { Switches, Scroll, SongList, NoResult },
  methods: {
    switchItem(index) {
      this.currentIndex = index
    },
    selectSong(song) {
      // Song的实例
      this.insertSong(new Song(song))
    },
    back() {
      this.$router.back()
    },
    random() {
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      if (!list.length) {
        return
      }
      list = list.map(item => {
        return new Song(item)
      })
      this.randomPlay({ list })
    },
    handlePlayList(list) {
      const bottom = list.length > 0 ? '60px' : 0
      this.$refs.listWrapperRef.style.bottom = bottom
      this.$refs.songListRef && this.$refs.songListRef.refresh()
      this.$refs.searchListRef && this.$refs.searchListRef.refresh()
    },
    ...mapActions(['insertSong', 'randomPlay'])
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/variable';
@import "../../common/stylus/mixin";

.user-center
  position fixed
  top 0
  bottom 0
  z-index 100
  width 100%
  background-color $color-background
  &.slide-enter-active, &.slide-leave-active
    transition all 0.3s
  &.slide-enter, &.slide-leave-to
    transform translate3d(100%, 0, 0)
  .back
    position absolute
    top 0
    left 6px
    z-index 50
    .icon-back
      display block
      padding 10px
      font-size $font-size-large-x
      color $color-theme
  .switches-wrapper
    margin 10px 0 30px 0
  .play-btn
    box-sizing border-box
    width 135px
    padding 7px 0
    margin 0 auto
    text-align center
    border 1px solid $color-text-l
    color $color-text-l
    border-radius 100px
    font-size 0
    .icon-play
      display inline-block
      vertical-align middle
      margin-right 6px
      font-size $font-size-medium-x
    .text
      display inline-block
      vertical-align middle
      margin-right 6px
      font-size $font-size-medium
  .list-wrapper
    position absolute
    top 110px
    bottom 0
    width 100%
    .list-scroll
      height 100%
      overflow hidden
      .list-inner
        padding 20px 30px
  .no-result-wrapper
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
</style>
