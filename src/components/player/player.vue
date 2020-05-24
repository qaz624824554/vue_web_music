<template>
  <div class="player" v-show="playList.length > 0">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image" />
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdPlay">
                <img class="image" :src="currentSong.image" />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.line">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p class="text" :class="{'current' : currentLineNum === index}" ref="lyricLine" v-for="(line, index) in currentLyric.lines" :key="index">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :precent="precent" @percentChange="percentChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i :class="getFavoriteIcon(currentSong)"  @click.stop="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img width="40" height="40" :src="currentSong.image" :class="cdPlay" />
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :precent="precent">
            <i :class="miniPlayIcon" @click.stop="togglePlaying" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlistRef"></playlist>
    <audio :src="currentSong.url" ref="audio" @play="ready" @error="error" @timeupdate="timeUpdate" @ended="end"></audio>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom.js'
import ProgressBar from 'base/progress-bar/progress-bar.vue'
import ProgressCircle from 'base/progress-circle/progress-circle.vue'
import { playMode } from 'common/js/config.js'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll.vue'
import Playlist from 'components/playlist/playlist.vue'
import { playMixin } from 'common/js/mixins.js'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniPlayIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdPlay() {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    precent() {
      return this.currentTime / this.currentSong.duration
    }
  },
  methods: {
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    // 进入钩子
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale()

      let animation = {
        0: {
          // 左下角
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }

      animations.registerAnimation({
        name: 'move',
        animation: animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })

      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter(el) {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    // 离开钩子
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s linear'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave(el) {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // 暂停切换按钮
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      // 解决歌曲暂停歌词跳动
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    _getPosAndScale() {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    prev() {
      if (!this.songReady) {
        return
      }
      if (this.mode === playMode.loop) {
        this.loop()
        return
      }
      if (this.playList.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playList.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentSong.url === '') {
          this.prev()
        }
      }
      this.songReady = false
    },
    next() {
      if (!this.songReady) {
        return
      }
      if (this.mode === playMode.loop) {
        this.loop()
        return
      }
      if (this.playList.length === 1) {
        this.loop()
      }
      let index = this.currentIndex + 1
      if (index === this.playList.length) {
        index = 0
      } else {
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentSong.url === '') {
          this.next()
        }
      }
      this.songReady = false
    },
    // 播放器准备完成
    ready() {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    // 播放器出现错误
    error() {
      this.songReady = true
    },
    timeUpdate(e) {
      this.currentTime = e.target.currentTime
    },
    // 处理进度条时间
    format(interval) {
      let minutes = interval / 60 | 0
      let seconds = this._path(Math.floor(interval % 60))
      return `${minutes}:${seconds}`
    },
    percentChange(precent) {
      const currentTime = precent * this.currentSong.duration
      if (!this.playing) {
        this.togglePlaying()
      }
      this.$refs.audio.currentTime = currentTime
      // 解决跳动进度条歌词没跟随
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000) // 转成ms
      }
    },
    // 歌曲结束播放触发
    end() {
      if (this.mode === playMode.loop) {
        this.loop()
        return
      }
      this.next()
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      // 解决歌曲循环歌词复原
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 获取歌词
    getLyric() {
      this.currentSong.getLyric().then(lyric => {
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 处理歌词
    handleLyric({lineNum, txt}) {
      this.currentLineNum = lineNum
      // 歌词滚动
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        // 刷新>>>>>>>>>>>>>>>>
        this.$refs.lyricList.refresh()
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart(e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      this.touch.startY = e.touches[0].pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      // 左划负，右划正
      const deltaX = e.touches[0].pageX - this.touch.startX
      const deltaY = e.touches[0].pageY - this.touch.startY

      if (Math.abs(deltaX) < Math.abs(deltaY)) {
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 划的宽度不能超过屏幕宽度
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.touch.precent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.middleL.style.opacity = 1 - this.touch.precent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd() {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        // 超过10%
        if (this.touch.precent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 超过10%
        if (this.touch.precent < 0.9) {
          offsetWidth = 0
          opacity = 1
          this.currentShow = 'cd'
        } else {
          opacity = 0
          offsetWidth = -window.innerWidth
        }
      }

      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    _path(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    showPlaylist() {
      this.$refs.playlistRef.show()
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING'
    }),
    ...mapActions(['savePlayHistory'])
  },
  created() {
    // 不需要getters和setters
    this.touch = {}
  },
  watch: {
    currentSong(newSong, OldSong) {
      if (!newSong.id) {
        return
      }
      if (newSong.id === OldSong.id) {
        return
      }
      // 歌词来回闪动
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
    },
    playing(newPlaying) {
      this.$nextTick(() => {
        newPlaying ? this.$refs.audio.play() : this.$refs.audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable";
@import "../../common/stylus/mixin";

.player
  .normal-player
    position fixed
    left 0
    right 0
    top 0
    bottom 0
    z-index 150
    background $color-background
    .background
      position absolute
      left 0
      top 0
      width 100%
      height 100%
      z-index -1
      opacity 0.6
      filter blur(20px)
    .top
      position relative
      margin-bottom 25px
      .back
        position absolute
        top 0
        left 6px
        z-index 50
        .icon-back
          display block
          padding 9px
          font-size $font-size-large-x
          color $color-theme
          transform rotate(-90deg)
      .title
        width 70%
        margin 0 auto
        line-height 40px
        text-align center
        no-wrap()
        font-size $font-size-large
        color $color-text
      .subtitle
        line-height 20px
        text-align center
        font-size $font-size-medium
        color $color-text
    .middle
      position fixed
      width 100%
      top 80px
      bottom 170px
      white-space nowrap
      font-szie 0
      .middle-l
        display inline-block
        vertical-align top
        position relative
        width 100%
        height 0
        padding-top 80%
        .cd-wrapper
          position absolute
          left 10%
          top 0
          width 80%
          height 100%
          .cd
            width 100%
            height 100%
            box-sizing border-box
            border 10px solid rgba(255, 255, 255, 0.1)
            border-radius 50%
            &.play
              animation rotate 20s linear infinite
            &.pause
              animation-play-state paused
            .image
              position absolute
              left 0
              top 0
              width 100%
              height 100%
              border-radius 50%
        .playing-lyric-wrapper
          width 80%
          margin 30px auto 0 auto
          overflow hidden
          text-align center
          .playing-lyric
            height 20px
            line-height 20px
            font-size $font-size-medium
            color $color-text-l
      .middle-r
        display inline-block
        vertical-align top
        width 100%
        height 100%
        overflow hidden
        .lyric-wrapper
          width 80%
          margin 0 auto
          overflow hidden
          text-align center
          .text
            line-height 32px
            color $color-text-l
            font-size $font-size-medium
            &.current
              color $color-text
    .bottom
      position absolute
      bottom 50px
      width 100%
      .dot-wrapper
        text-align center
        font-size 0
        .dot
          display inline-block
          vertical-align middle
          margin 0 4px
          width 8px
          height 8px
          border-radius 50%
          background-color $color-text-ll
          &.active
            width 20px
            border-radius 5px
            background-color $color-text-ll
      .progress-wrapper
        display flex
        align-items center
        width 80%
        margin 0 auto
        padding 10px 0
        .time
          color $color-text
          font-size $font-size-small
          flex 0 0 30px
          line-height 30px
          // width 30px
          &.time-l
            text-align left
          &.time-r
            text-align right
        .progress-bar-wrapper
          flex 1
      .operators
        display flex
        align-items center
        .icon
          flex 1
          color $color-theme
          &.disable
            color $color-theme-d
          i
            font-size 30px
        .i-left
          text-align right
        .i-center
          padding 0 20px
          text-align center
          i
            font-size 40px
        .i-right
          text-align left
          .icon-favorite
            color $color-sub-theme
    &.normal-enter-active, &.normal-leave-active
      transition all 0.4s
      .top, .bottom
        transition all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
    &.normal-enter, &.normal-leave-to
      opacity 0
      .top
        transform translate3d(0, -100px, 0)
      .bottom
        transform translate3d(0, 100px ,0)
  .mini-player
    display flex
    align-items center
    position fixed
    left 0
    bottom 0
    z-index 180
    width 100%
    height 60px
    background-color $color-highlight-background
    .icon
      flex 0 0 40px
      width 40px
      padding 0 10px 0 20px
      img
        border-radius 50%
        &.play
          animation rotate 20s linear infinite
        &.pause
          animation-play-state paused
    .text
      display flex
      flex-direction column
      justify-content center
      flex 1
      line-height 20px
      overflow hidden
      .name
        margin-bottom 2px
        no-wrap()
        font-size $font-size-medium
        color $color-text-d
      .desc
        no-wrap()
        font-size $font-size-small
        color $color-text-d
    .control
      flex 0 0 30px
      width 30px
      padding 0 10px
      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size 30px
        color $color-theme-d
      .icon-mini
        font-size 32px
        position absolute
        top 0
        left 0
    &.mini-enter-active, &.mini-leave-active
      transition all 0.4s
    &.mini-enter, &.mini-leave-to
      opacity 0

@keyframes rotate
  0%
    transform rotate(0)
  100%
    transform rotate(360deg)
</style>
