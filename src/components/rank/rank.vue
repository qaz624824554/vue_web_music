<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" :data="topList" ref="topList">
      <ul>
        <li
          class="item"
          v-for="(item1, index1) in topList"
          :key="index1"
          @click="selectItem(item1)"
        >
          <div class="icon">
            <img width="100" height="100" v-lazy="item1.picUrl" />
          </div>
          <ul class="songlist">
            <li
              class="song"
              v-for="(item2, index2) in item1.songList"
              :key="index2"
            >
              <span>{{ index2 + 1 }}</span>
              <span>{{ item2.songname }}-{{ item2.singername }}</span>
            </li>
          </ul>
        </li>
      </ul>
      <loading class="loading-wrapper" v-show="!topList.length"></loading>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { getTopList } from 'api/rank.js'
import { ERR_OK } from 'api/config.js'
import Scroll from 'base/scroll/scroll.vue'
import { playListMixin } from 'common/js/mixins.js'
import Loading from 'base/loading/loading'
import { mapMutations } from 'vuex'

export default {
  mixins: [playListMixin],
  data() {
    return {
      topList: []
    }
  },
  created() {
    this._getToplist()
  },
  methods: {
    _getToplist() {
      getTopList().then(res => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    handlePlayList(newVal) {
      const bottom = newVal.length > 0 ? '60px' : ''
      this.$refs.rank.style.bottom = bottom
      this.$refs.topList.refresh()
    },
    selectItem(item) {
      this.$router.push({
        path: `/rank/${item.id}`
      })
      this.setTopList(item)
    },
    ...mapMutations({
      setTopList: 'SET_TOP_LIST'
    })
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable";
@import "../../common/stylus/mixin";

.rank
  position fixed
  width 100%
  top 88px
  bottom 0
  .toplist
    height 100%
    overflow hidden
    .item
      display flex
      margin 0 20px
      padding-top 20px
      height 100px
      .icon
        flex 0 0 100px
        width 100px
        height 100px
      .songlist
        flex 1
        display flex
        flex-direction column
        justify-content center
        padding 0 20px
        height 100px
        overflow hidden
        background-color $color-highlight-background
        color $color-text-d
        font-size $font-size-small
        .song
          no-wrap()
          line-height 26px
    .loading-wrapper
      position absolute
      left 50%
      transform translateX(-50%)
      top 50%
</style>
