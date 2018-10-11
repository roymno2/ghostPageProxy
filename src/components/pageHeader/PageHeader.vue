<template>
  <div class="page-header-container f-height-full f-col-list">
    <div class="f-grow-0 page-header-dropdown-nav-outer flex-outer">
      <div class="flex-inner">
        <dropdown-nav></dropdown-nav>
      </div>
    </div>
    <div class="f-grow-1">
      <div class="page-header-page-name">{{$route.meta.pageName}}</div>
    </div>
  </div>
</template>

<script>
import dropdownNav from '../dropdownNav/DropdownNav'
export default {
  data () {
    return {
    }
  },
  props: {
  },
  computed: {
  },
  components: {
    dropdownNav
  },
  ready () {
  },
  methods: {
    jumpToMainRisk () {
      if (this.$route.name === 'main') {
        this.$emit('jumptorisktable')
      } else {
        this.$router.push({name: 'main', params: {'jump': 'mainrisktable'}})
      }
    }
  },
  watch: {
  }
}
</script>

<style src="./pageHeader.less" lang="less"></style>
