<template>
  <div class="c-main-card-std f-row-list f-height-full">
    <div class="f-grow-1 flex-outer">
      <div class="flex-inner f-col-list f-center">
        <div class="f-grow-0 c-main-card-std-logo">
          <img class="c-main-card-std-logo-inner" src="./assets/visa.png" alt="visa" />
        </div>
        <div class="f-grow-2 c-main-card-std-col-2">
          <div class="c-main-card-std-value">
            {{data['visa']['count']}}
          </div>
          <div class="c-main-card-std-tip">
            {{data['visa']['countTip']}}
          </div>
        </div>
        <div class="f-grow-3 c-main-card-std-col-3">
          <div class="c-main-card-std-value">
            {{data['visa']['amount']}}
          </div>
          <div class="c-main-card-std-tip">
            {{data['visa']['amountTip']}}
          </div>
        </div>
      </div>
    </div>
    <div class="f-grow-1 flex-outer">
      <div class="flex-inner f-col-list f-center">
        <div class="f-grow-0 c-main-card-std-logo">
          <img class="c-main-card-std-logo-inner" src="./assets/master.png" alt="master" />
        </div>
        <div class="f-grow-2 c-main-card-std-col-2">
          <div class="c-main-card-std-value">
            {{data['master']['count']}}
          </div>
          <div class="c-main-card-std-tip">
            {{data['master']['countTip']}}
          </div>
        </div>
        <div class="f-grow-3  c-main-card-std-col-3">
          <div class="c-main-card-std-value">
            {{data['master']['amount']}}
          </div>
          <div class="c-main-card-std-tip">
            {{data['master']['amountTip']}}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'mainCardStd',
  data () {
    return {
    }
  },
  props: {
    data: {
      type: Object
    }
  },
  components: {
  },
  mounted () {
  },
  updated () {
  },
  destroy () {
  },
  computed: {
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style src="./mainCardStd.less" lang="less"></style>
