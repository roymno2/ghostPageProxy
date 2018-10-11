<template>
  <div class="dropdown-nav-container">
    <img class="dropdown-nav-container-logo" src="./assets/menu.png" alt="menu" />
    <ul class="dropdown-nav-links-container" :class="{ 'open-left': openLeft }">
      <li class="dropdown-nav-link" v-for="link in navLinks" :key="link.name">
        <router-link v-if="link.name" class="dropdown-nav-link-cell" :class="{ 'dropdown-nav-link-cell-not-current': checkNotCurrent(link.name) }" :to="{ name: link.name, params: link.params }">
          <i :class="link.className"></i>
          <span>{{ link.label }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>
<script>

export default {
  props: {
    openLeft: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      navLinks: [
        {
          name: 'main',
          label: '代理记录',
          params: {}
        },
        {
          name: 'config',
          label: '配置中心',
          params: {}
        }
      ]
    }
  },
  components: {
  },
  methods: {
    checkNotCurrent (routeName) {
      return this.$route.name !== routeName
    }
  },
  watch: {
  }
}
</script>

<style src="./dropdownNav.less" lang="less"></style>
