<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-img="bgImg"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail, getSongUrl } from 'api/singer.js'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song.js'
import MusicList from 'components/music-list/music-list.vue'

const PURL = 'https://isure.stream.qqmusic.qq.com/'

export default {
  data() {
    return {
      songs: [],
      filtersongs: []
    }
  },
  computed: {
    title() {
      return this.singer.name
    },
    bgImg() {
      return this.singer.avatar
    },
    ...mapGetters(['singer'])
  },
  created() {
    this._getSingerDetail()
  },
  methods: {
    _getSingerDetail() {
      if (!this.singer.id) {
        this.$router.push('/singer')
      }
      return new Promise((resolve, reject) => {
        getSingerDetail(this.singer.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item, index) => {
        let { musicData } = item
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
        getSongUrl(musicData.songmid).then(res => {
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
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable";

  .slide-enter-active, .slide-leave-active
    transition all .3s
  .slide-enter, .slide-leave-to
    transform translate3d(100%, 0, 0)
</style>
