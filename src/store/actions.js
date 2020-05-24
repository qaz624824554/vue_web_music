import * as types from './mutation-types'
import { shuffle } from 'common/js/util.js'
import { playMode } from 'common/js/config.js'
import { saveSearch, deleteSearch, clearStorage, savePlayHistory, saveFavoriteList, deleteFavoriteList } from 'common/js/catch.js'

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}

const actions = {
  selectPlay({ commit, state }, { list, index }) {
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
      let randomList = shuffle(list)
      commit(types.SET_PLAY_LIST, randomList)
      index = findIndex(list, list[index])
    } else {
      commit(types.SET_PLAY_LIST, list)
    }
    commit(types.SET_PLAY_LIST, list)
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING, true)
  },
  randomPlay({ commit, state }, { list }) {
    let randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)
    commit(types.SET_SEQUENCE_LIST, list)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_MODE, playMode.random)
    // url为空不播放
    if (state.playList[state.currentIndex].url !== '') {
      commit(types.SET_PLAYING, true)
      commit(types.SET_FULL_SCREEN, true)
    } else {
      commit(types.SET_PLAYING, false)
      commit(types.SET_FULL_SCREEN, false)
    }
  },
  insertSong({ commit, state }, song) {
    let playlist = state.playList.slice()
    let sequencelist = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let currentSong = playlist[currentIndex]
    // 查找列表是否有这首歌曲
    let fpIndex = findIndex(playlist, song)
    // 插入歌曲所以索引+1
    currentIndex++
    // 当前歌曲的后面插入歌曲
    playlist.splice(currentIndex, 0, song)
    // 列表有这首歌
    if (fpIndex > -1) {
      // 当前插入的序号大于列表中的序号
      if (currentIndex > fpIndex) {
        playlist.splice(fpIndex, 1)
        currentIndex--
      } else {
        playlist.splice(fpIndex + 1, 1)
      }
    }

    let currentSIndex = findIndex(sequencelist, currentSong) + 1

    let fsIndex = findIndex(sequencelist, song)

    sequencelist.splice(currentSIndex, 0, song)

    if (fsIndex > -1) {
      if (currentSIndex > fsIndex) {
        sequencelist.splice(fsIndex, 1)
      } else {
        sequencelist.splice(fsIndex + 1, 1)
      }
    }
    commit(types.SET_PLAY_LIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequencelist)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_PLAYING, true)
    commit(types.SET_FULL_SCREEN, true)
  },
  insertSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
  },
  deleteSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
  },
  clearSearchHistory({ commit }, query) {
    commit(types.SET_SEARCH_HISTORY, clearStorage())
  },
  deleteOne({ commit, state }, song) {
    let playlist = state.playList.slice()
    let sequencelist = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let pIndex = findIndex(playlist, song)
    playlist.splice(pIndex, 1)

    let sIndex = findIndex(sequencelist, song)
    sequencelist.splice(sIndex, 1)

    if (currentIndex > pIndex || currentIndex === playlist.length) {
      currentIndex--
    }

    commit(types.SET_PLAY_LIST, playlist)
    commit(types.SET_SEQUENCE_LIST, sequencelist)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    const playFlow = playlist.length > 0
    commit(types.SET_PLAYING, playFlow)
  },
  clearPlaylist({ commit }) {
    commit(types.SET_PLAY_LIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING, false)
  },
  savePlayHistory({ commit }, song) {
    commit(types.SET_PLAY_HISTORY, savePlayHistory(song))
  },
  saveFavorite({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, saveFavoriteList(song))
  },
  deleteFavorite({ commit }, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavoriteList(song))
  }
}

export default actions
