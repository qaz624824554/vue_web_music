<template>
  <transition name="slide">
      <music-list :title="title" :bg-img="bgImg" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list.vue'
import { mapGetters } from 'vuex'
import { getMusicList } from 'api/rank.js'
import { ERR_OK } from 'api/config.js'
import { createSong } from 'common/js/song.js'
import { getSongUrl } from 'api/singer.js'

const PURL = 'https://isure.stream.qqmusic.qq.com/'

export default {
  data() {
    return {
      songs: [],
      rank: true
    }
  },
  computed: {
    title() {
      return this.topList.topTitle
    },
    bgImg() {
      return this.topList.picUrl
    },
    ...mapGetters(['topList'])
  },
  created() {
    this._getMusicList()
  },
  methods: {
    _getMusicList() {
      if (!this.topList.id) {
        this.$router.back()
        return
      }
      getMusicList(this.topList.id).then(res => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeMusicList(res.songlist)
        }
      })
    },
    _normalizeMusicList(list) {
      let ret = []
      list.forEach((item, index) => {
        let musicData = item.data
        if (musicData.albumid && musicData.songid) {
          ret.push(createSong(musicData))
        }
        getSongUrl(musicData.songmid).then(res => {
          ret[index].url = PURL + res.url
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
.slide-leave-active, .slide-enter-active
  transition all 0.3s
.slide-enter, .slide-leave-to
  transform translate3d(100%, 0, 0)
</style>
