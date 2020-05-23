<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="getQuery"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapperRef">
      <!-- scroll只能包含一个子标签 -->
      <scroll
        class="shortcut"
        :data="shortcut"
        ref="shortcutRef"
        v-show="!query"
        :refreshDelay="refreshDelay"
      >
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li
                class="item"
                v-for="(item, index) in hotKeyList"
                :key="index"
                @click="addQuery(item.k)"
              >
                <span>{{ item.k }}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list
              :searches="searchHistory"
              @select="addQuery"
              @delete="deleteSearchHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-resulut" v-show="query" ref="searchResulutRef">
      <suggest
        :query="query"
        @beforeScrollStart="beforeScroll"
        @searchHistory="search"
        ref="suggestRef"
      ></suggest>
    </div>
    <confirm
      ref="confirmRef"
      text="是否清空搜索历史记录"
      @confirm="clearSearchHistory"
    ></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box.vue'
import { ERR_OK } from 'api/config'
import { getHotKey } from 'api/search.js'
import Suggest from 'components/suggest/suggest.vue'
import { mapActions } from 'vuex'
import SearchList from 'base/search-list/search-list.vue'
import Confirm from 'base/confirm/confirm.vue'
import Scroll from 'base/scroll/scroll.vue'
import { playListMixin, searchMixin } from 'common/js/mixins.js'

export default {
  mixins: [playListMixin, searchMixin],
  data() {
    return {
      hotKeyList: [],
      zhida: true,
      query: ''
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  },
  computed: {
    shortcut() {
      return this.hotKeyList.concat(this.searchHistory)
    }
  },
  created() {
    this._getHotKey()
  },
  methods: {
    _getHotKey() {
      getHotKey().then(res => {
        if (res.code === ERR_OK) {
          this.hotKeyList = res.data.hotkey.slice(0, 10)
        }
      })
    },
    showConfirm() {
      this.$refs.confirmRef.show()
    },
    // 重置高度
    handlePlayList(playlist) {
      let bottom = playlist.length > 0 ? '60px' : 0

      this.$refs.shortcutWrapperRef.style.bottom = bottom
      this.$refs.shortcutRef.refresh()

      this.$refs.searchResulutRef.style.bottom = bottom
      this.$refs.suggestRef.refresh()
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  },
  watch: {
    query(newVal) {
      if (!newVal) {
        setTimeout(() => {
          this.$refs.shortcutRef.refresh()
        }, 20)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import '../../common/stylus/variable'
@import "../../common/stylus/mixin"

.search
  .search-box-wrapper
    margin 15px 20px
  .shortcut-wrapper
    position fixed
    top 178px
    bottom 0
    width 100%
    .shortcut
      height 100%
      overflow hidden
      .hot-key
        margin 0 20px 20px 20px
        .title
          margin-bottom 20px
          font-size $font-size-medium
          color $color-text-l
        .item
          display inline-block
          padding 5px 10px
          margin 0 20px 10px 0
          border-radius 6px
          background-color $color-highlight-background
          font-size $font-size-medium
          color $color-text-d
      .search-history
        position relative
        margin 0 20px
        .title
          display flex
          align-items center
          height 40px
          font-size $font-size-medium
          color $color-text-l
          .text
            flex 1
          .clear
            extend-click()
            .icon-clear
              font-size $font-size-medium
              color $color-text-d
  .search-resulut
    position fixed
    width 100%
    top 178px
    bottom 0
</style>
