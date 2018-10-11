<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'App',
  created () {
    window.addEventListener('resize', this.changePageSize)
    console.log(this)
  },
  destroyed () {
    window.removeEventListener('resize', this.changePageSize)
  },
  methods: {
    ...mapActions([
      'changePageSize'
    ])
  }
}
</script>

<style src="./assets/app.less" lang="less"></style>
