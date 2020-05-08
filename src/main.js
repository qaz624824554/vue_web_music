import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick'
import './common/stylus/index.styl'
import lazyload from 'vue-lazyload'

Vue.use(lazyload, {
  loading: require('./common/image/default.png')
})

fastclick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
