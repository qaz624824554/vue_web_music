import * as types from './mutation-types'
import { shuffle } from 'common/js/util.js'
import { playMode } from 'common/js/config.js'

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
  randomPlay({ commit }, { list }) {
    let randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)
    commit(types.SET_SEQUENCE_LIST, list)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_MODE, playMode.random)
    commit(types.SET_PLAYING, true)
    commit(types.SET_FULL_SCREEN, true)
  }
}

export default actions
