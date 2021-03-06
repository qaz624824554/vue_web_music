import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15

const PLAY_HISTORY_KEY = '__play__'
const PLAY_HISTORY_MAX_LEN = 200

const FAVORITE_LIST_KEY = '__favorite__'
const FAVORITE_LIST_MAX_LEN = 200

function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(
    searches,
    query,
    item => {
      return item === query
    },
    SEARCH_MAX_LEN
  )
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function getStorage() {
  return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, item => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

export function clearStorage() {
  storage.remove(SEARCH_KEY)
  return []
}

export function savePlayHistory(song) {
  const songs = storage.get(PLAY_HISTORY_KEY, [])
  insertArray(songs, song, item => {
    return item.id === song.id
  }, PLAY_HISTORY_MAX_LEN)
  storage.set(PLAY_HISTORY_KEY, songs)
  return songs
}

export function loadPlayHistory() {
  return storage.get(PLAY_HISTORY_KEY, [])
}

export function saveFavoriteList(song) {
  const songs = storage.get(FAVORITE_LIST_KEY, [])
  insertArray(songs, song, item => {
    return item.id === song.id
  }, FAVORITE_LIST_MAX_LEN)
  storage.set(FAVORITE_LIST_KEY, songs)
  return songs
}

export function deleteFavoriteList(song) {
  const songs = storage.get(FAVORITE_LIST_KEY, [])
  deleteFromArray(songs, item => {
    return item.id === song.id
  })
  storage.set(FAVORITE_LIST_KEY, songs)
  return songs
}

export function loadFavorite() {
  return storage.get(FAVORITE_LIST_KEY, [])
}
