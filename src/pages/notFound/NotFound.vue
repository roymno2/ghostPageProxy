<template>
  <div class="notFound">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'notFound',
  data () {
    return {
      msg: '404'
    }
  }
}
</script>

<style src="./notFound.less" lang="less"></style>
