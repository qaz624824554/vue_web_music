import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config.js'
import { shuffle } from 'common/js/util.js'

export const playListMixin = {
  mounted() {
    this.handlePlayList(this.playList)
  },
  activated() {
    this.handlePlayList(this.playList)
  },
  computed: {
    ...mapGetters(['playList'])
  },
  watch: {
    playList(newVal) {
      this.handlePlayList(newVal)
    }
  },
  methods: {
    handlePlayList() {
      throw new Error('component must implement handlePlayList method ')
    }
  }
}

export const playMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'fullScreen',
      'playList',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList',
      'favoriteList'
    ])
  },
  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setMode(mode)
      let list = null
      if (mode === playMode.random) {
        list = shuffle(this.playList)
      } else {
        list = this.sequenceList
      }
      // 重设置当前Index
      this.resetCurrentIndex(list)
      // 改变播放列表
      this.setPlayList(list)
    },
    resetCurrentIndex(list) {
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getFavoriteIcon(song) {
      if (this.isFavorite(song)) {
        return 'icon-favorite'
      } else {
        return 'icon-not-favorite'
      }
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavorite(song)
      } else {
        this.saveFavorite(song)
      }
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex(item => {
        return item.id === song.id
      })
      return index > -1
    },
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setMode: 'SET_MODE',
      setPlayList: 'SET_PLAY_LIST',
      setPlaying: 'SET_PLAYING'
    }),
    ...mapActions(['saveFavorite', 'deleteFavorite'])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters(['searchHistory'])
  },
  methods: {
    getQuery(val) {
      this.query = val
    },
    beforeScroll() {
      this.$refs.searchBox.blur()
    },
    search() {
      this.insertSearchHistory(this.query)
    },
    addQuery(k) {
      this.$refs.searchBox.setQuery(k)
    },
    ...mapActions(['insertSearchHistory', 'deleteSearchHistory'])
  }
}
