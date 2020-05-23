<template>
  <transition name="slide">
    <music-list :bgImg="bgImg" :title="title" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list.vue'
import { mapGetters } from 'vuex'
import { getSongList } from 'api/recommend.js'
import { ERR_OK } from 'api/config.js'
import { createSong } from 'common/js/song.js'
import { getSongUrl } from 'api/singer.js'

const PURL = 'https://isure.stream.qqmusic.qq.com/'

export default {
  components: {
    MusicList
  },
  data() {
    return {
      songs: []
    }
  },
  computed: {
    bgImg() {
      return this.disc.imgurl
    },
    title() {
      return this.disc.dissname
    },
    ...mapGetters(['disc'])
  },
  created() {
    this._getSongList()
  },
  methods: {
    _getSongList() {
      // 刷新退回上一路由
      if (!this.disc.dissid) {
        this.$router.back()
      }
      getSongList(this.disc.dissid).then(res => {
        if (res.code === ERR_OK) {
          this.songs = this._nomalizeSongList(res.cdlist[0].songlist)
        }
      })
    },
    _nomalizeSongList(list) {
      let ret = []
      list.forEach((item, index) => {
        if (item.albummid && item.songmid) {
          ret.push(createSong(item))
        }
        getSongUrl(item.songmid).then(res => {
          if (res.code === ERR_OK) {
            try {
              if (res.url.length > 0) {
                ret[index].url = PURL + res.url
              }
            } catch (error) {}
          }
        })
      })
      return ret
    }
  }
}
</script>

<style lang="stylus" scoped>
.slide-enter-active, .slide-leave-active
  transition all 0.3s
.slide-enter, .slide-leave-to
  transform translate3d(100%, 0, 0)
</style>
