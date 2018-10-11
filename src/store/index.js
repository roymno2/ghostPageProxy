import Vue from 'vue'
import Vuex from 'vuex'
// import * as actions from './root-actions'
// import * as getters from './root-getters'
import page from './modules/page'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  // actions,
  // getters,
  modules: {
    page
  },
  strict: debug
})
