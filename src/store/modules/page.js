import * as types from '../mutation-types'

// initial state
const state = {
  sizeChange: false
}

// getters
const getters = {
  pageSize: state => state.sizeChange
}

// actions
const actions = {
  changePageSize ({ commit }) {
    commit(types.CHANGE_PAGE_SIZE)
  }
}

// mutations
const mutations = {
  [types.CHANGE_PAGE_SIZE] (state) {
    state.sizeChange = !state.sizeChange
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
