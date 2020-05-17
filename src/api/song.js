import { commonParams } from './config'
import axios from 'axios'

export const getLyric = mid => {
  const url = '/api/getLyric'
  const data = Object.assign({}, commonParams, {
    songmid: mid,
    format: 'json',
    g_tk: 67232076,
    pcachetime: +new Date(),
    platform: 'yqq',
    needNewCode: 0,
    hostUin: 0
  })

  return axios
    .get(url, {
      params: data
    })
    .then(res => {
      return Promise.resolve(res.data)
    })
}
