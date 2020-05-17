<template>
  <div class="singer" ref="singer">
    <listview :data="singerList" @select="selectSinger" ref="listview"></listview>
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from 'api/singer.js'
import { ERR_OK } from 'api/config'
import Singer from 'common/js/singer.js'
import Listview from 'base/listview/listview.vue'
import { mapMutations } from 'vuex'
import { playListMixin } from 'common/js/mixins.js'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export default {
  mixins: [playListMixin],
  data() {
    return {
      singerList: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // 为state.singer传递值
      this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singerList = this._normalizeSinger(res.data.list)
        }
      })
    },
    handlePlayList(playlist) {
      const bottom = playlist.length > 0 ? '60px' : 0
      this.$refs.singer.style.bottom = bottom
      this.$refs.listview.refresh()
    },
    // 对数据进行改造
    _normalizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(
            new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            })
          )
        }
        const key = item.Findex
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        map[key].items.push(
          new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          })
        )
      })
      // 将map对象转成有序数组
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    Listview
  }
}
</script>

<style lang="stylus" scoped>
.singer
  position fixed
  top 88px
  bottom 0
  width 100%
</style>
