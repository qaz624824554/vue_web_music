<template>
  <scroll
    class="suggest"
    :data="result"
    :pullup="pullup"
    @scrollToEnd="searchMore"
    ref="suggest"
    :beforeScroll="beforeScroll"
    @beforeScroll="beforeScrollStart"
  >
    <ul class="suggest-list">
      <li
        class="suggest-item"
        v-for="(item, index) in result"
        :key="index"
        @click="selectItem(item)"
      >
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore && !result.length">
      <no-result title="抱歉，没有找到该歌曲"></no-result>
    </div>
  </scroll>
</template>

<script>
import { getSearch } from 'api/search.js'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song.js'
import { getSongUrl } from 'api/singer.js'
import Scroll from 'base/scroll/scroll.vue'
import Loading from 'base/loading/loading.vue'
import { mapMutations, mapActions } from 'vuex'
import Singer from 'common/js/singer.js'
import NoResult from 'base/no-result/no-result.vue'

const TYPE_SINGER = 'singer'
const PERPAGE = 20
const PURL = 'https://isure.stream.qqmusic.qq.com/'

export default {
  data() {
    return {
      result: [],
      page: 1,
      pullup: true,
      hasMore: true,
      beforeScroll: true
    }
  },
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    query() {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  },
  methods: {
    search() {
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      getSearch(this.query, this.page, this.showSinger, PERPAGE).then(res => {
        if (res.code === ERR_OK) {
          this.result = this._genResult(res.data)
          this._checkMore(res.data)
          // console.log(res.data)
        }
      })
    },
    _genResult(data) {
      let ret = []
      if (data.zhida.zhida_singer && data.zhida.zhida_singer.singerID) {
        ret.push({ ...data.zhida.zhida_singer, ...{ type: TYPE_SINGER } })
      }
      try {
        // 列表没有歌手
        if (data.song.curnum > 0 && !data.zhida.zhida_singer) {
          data.song.list.forEach((item, index) => {
            if (item.albummid && item.songmid) {
              ret.push(createSong(item))
            }
            getSongUrl(item.songmid).then(res => {
              try {
                if (res.url.length > 0) {
                  ret[index].url = PURL + res.url
                }
              } catch (e) {}
            })
          })
        // 列表有歌手
        } else if (data.song.curnum > 0 && data.zhida.zhida_singer) {
          data.song.list.forEach((item, index) => {
            if (item.albummid && item.songmid) {
              ret.push(createSong(item))
            }
            getSongUrl(item.songmid).then(res => {
              try {
                if (res.url.length > 0) {
                  ret[index + 1].url = PURL + res.url
                }
              } catch (e) {}
            })
          })
        }
      } catch (e) {}
      return ret
    },
    getIconCls(item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    getDisplayName(item) {
      if (item.type === TYPE_SINGER) {
        return item.singerName
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    // 上拉刷新
    searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      getSearch(this.query, this.page, this.showSinger, PERPAGE).then(res => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._genResult(res.data))
          this._checkMore(res.data)
        }
      })
    },
    _checkMore(data) {
      const song = data.song
      try {
        if (
          !song.list.length ||
          song.curnum + song.curpage * PERPAGE >= song.totalnum
        ) {
          this.hasMore = false
        }
      } catch (e) {}
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        this.$router.push({
          path: `/search/${item.singerMID}`
        })
        const singer = new Singer({
          id: item.singerMID,
          name: item.singerName
        })
        this.setSinger(singer)
      } else {
        if (item.url) {
          this.insertSong(item)
        } else {
          console.log('当前歌曲不可播放')
        }
      }
      this.$emit('searchHistory', item)
      // console.log(item)
    },
    beforeScrollStart() {
      this.$emit('beforeScrollStart')
    },
    refresh() {
      this.$refs.suggest.refresh()
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions(['insertSong'])
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/variable'
@import '../../common/stylus/mixin'

  .suggest
    height 100%
    overflow hidden
    z-index 999
    .suggest-list
      padding 0 30px
      .suggest-item
        display flex
        align-items center
        padding-bottom 20px
        .icon
          flex 0 0 30px
          width 30px
          [class^="icon-"]
            font-size 14px
            color $color-text-d
        .name
          flex 1
          font-size $font-size-medium
          color $color-text-d
          overflow hidden
          .text
            no-wrap()
    .no-result-wrapper
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>
