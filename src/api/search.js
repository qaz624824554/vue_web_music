import jsonp from 'common/js/jsonp.js'
import { commonParams, options } from 'api/config.js'

export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })

  return jsonp(url, data, options)
}

export function getSearch(query, page, zhida, perpage) {
  const url = 'https://c.y.qq.com/soso/fcgi-bin/client_search_cp'

  const data = Object.assign({}, {
    w: query,
    p: page,
    n: perpage,
    aggr: 1,
    cr: 1,
    flag_qc: 0,
    catZhida: zhida ? 1 : 0
  })

  return jsonp(url, data, options)
}
