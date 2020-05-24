import Vue from 'vue'
import Router from 'vue-router'
// import Rank from '../components/rank/rank.vue'
// import Recommend from '../components/recommend/recommend.vue'
// import Search from '../components/search/search.vue'
// import Singer from '../components/singer/singer.vue'
// import SingerDetail from '../components/singer-detail/singer-detail.vue'
// import Disc from '../components/disc/disc.vue'
// import TopList from '../components/top-list/ top-list.vue'
// import UserCenter from '../components/user-center/user-center.vue'

const Rank = () => import('../components/rank/rank.vue')
const Recommend = () => import('../components/recommend/recommend.vue')
const Search = () => import('../components/search/search.vue')
const Singer = () => import('../components/singer/singer.vue')
const SingerDetail = () => import('../components/singer-detail/singer-detail.vue')
const Disc = () => import('../components/disc/disc.vue')
const TopList = () => import('../components/top-list/ top-list.vue')
const UserCenter = () => import('../components/user-center/user-center.vue')

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      children: [
        {
          path: ':id',
          component: Disc
        }
      ]
    },
    {
      path: '/rank',
      component: Rank,
      children: [
        {
          path: ':id',
          component: TopList
        }
      ]
    },
    {
      path: '/search',
      component: Search,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    },
    {
      path: '/user',
      component: UserCenter
    }
  ]
})
