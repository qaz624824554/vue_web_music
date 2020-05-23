import { playMode } from 'common/js/config.js'
import { getStorage, loadPlayHistory } from 'common/js/catch.js'

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playList: [],
  sequenceList: [],
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: getStorage(),
  playHistory: loadPlayHistory()
}

export default state
