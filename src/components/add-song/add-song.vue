<template>
  <transition name="slide">
    <div class="add-song" v-show="hasShow" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box
          ref="searchBox"
          placeholder="搜索歌曲"
          @query="getQuery"
        ></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches
          :switches="switches"
          :currentIndex="currentIndex"
          @switch="switchItem"
        ></switches>
        <div class="list-wrapper">
          <scroll class="list-scroll" ref="songListRef" :data="playHistory" v-if="currentIndex === 0">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong"></song-list>
            </div>
          </scroll>
          <scroll class="list-scroll" ref="searchListRef" :data="searchHistory" v-if="currentIndex === 1" :refreshDelay="refreshDelay">
            <div class="list-inner">
              <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest
          :query="query"
          :showSinger="showSinger"
          @beforeScrollStart="beforeScroll"
          @searchHistory="selectSuggest"
        ></suggest>
      </div>
      <top-tip ref="topTipRef" :delay="delay">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放队列</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import SearchBox from 'base/search-box/search-box.vue'
import Suggest from 'components/suggest/suggest.vue'
import { searchMixin } from 'common/js/mixins.js'
import Switches from 'base/switches/switches.vue'
import SongList from 'base/song-list/song-list.vue'
import { mapGetters, mapActions } from 'vuex'
import Scroll from 'base/scroll/scroll.vue'
import Song from 'common/js/song.js'
import SearchList from 'base/search-list/search-list.vue'
import TopTip from 'base/top-tip/top-tip.vue'

export default {
  mixins: [searchMixin],
  data() {
    return {
      hasShow: false,
      showSinger: false,
      query: '',
      switches: [{ name: '最近播放' }, { name: '搜索历史' }],
      currentIndex: 0,
      delay: 1500
    }
  },
  computed: {
    ...mapGetters(['playHistory', 'searchHistory'])
  },
  methods: {
    hide() {
      this.hasShow = false
    },
    show() {
      this.hasShow = true
      // 刷新scroll
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songListRef.refresh()
        } else {
          this.$refs.searchListRef.refresh()
        }
      }, 20)
    },
    selectSuggest(item) {
      this.search()
      this.showTopTip()
    },
    switchItem(index) {
      this.currentIndex = index
    },
    selectSong(song, index) {
      if (index !== 0) {
        // 插入的歌曲不是Song类的实例，需要转化成Song的实例
        this.insertSong(new Song(song))
        this.showTopTip()
      }
    },
    showTopTip() {
      this.$refs.topTipRef.show()
    },
    ...mapActions(['insertSong'])
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    SongList,
    Scroll,
    SearchList,
    TopTip
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/variable';
@import "../../common/stylus/mixin";

.add-song
  position: fixed
  top: 0
  bottom: 0
  width: 100%
  z-index: 200
  background: $color-background
  &.slide-enter-active, &.slide-leave-active
    transition all 0.3s
  &.slide-enter, &.slide-leave-to
    transform translate3d(100%, 0, 0)
  .header
    position: relative
    height: 44px
    text-align: center
    .title
      line-height: 44px
      font-size: $font-size-large
      color: $color-text
    .close
      position: absolute
      top: 0
      right: 8px
      .icon-close
        display: block
        padding: 12px
        font-size: 20px
        color: $color-theme

  .search-box-wrapper
    margin 20px
  .shortcut
    .list-wrapper
      position absolute
      top 165px
      bottom 0
      width 100%
      .list-scroll
        height 100%
        overflow hidden
        .list-inner
          padding 20px 30px
  .search-result
    position: fixed
    top: 124px
    bottom: 0
    width: 100%
  .tip-title
    text-align center
    padding 18px 0
    font-size 0
    .icon-ok
      font-size $font-size-medium
      color $color-theme
      margin-right 4px
    .text
      font-size $font-size-medium
      color $color-text
</style>
