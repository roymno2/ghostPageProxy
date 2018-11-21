<template>
  <div class="c-main-card-std f-height-full f-col-list">
    <div class="f-grow-5 f-row-list">
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner f-col-list f-center">
          <div class="f-grow-0 c-main-card-std-logo">
            <img class="c-main-card-std-logo-inner" src="./assets/visa.png" alt="visa" />
          </div>
          <div class="f-grow-2 c-main-card-std-col-2">
            <div class="c-main-card-std-value">
              {{data['visa']['count']}}<span class="c-main-card-precent">%</span>
            </div>
            <div class="c-main-card-std-tip">
              {{data['visa']['countTip']}}
            </div>
          </div>
          <div class="f-grow-3 c-main-card-std-col-3">
            <div class="c-main-card-std-value">
              {{data['visa']['amount']}}<span class="c-main-card-precent">%</span>
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
              {{data['master']['count']}}<span class="c-main-card-precent">%</span>
            </div>
            <div class="c-main-card-std-tip">
              {{data['master']['countTip']}}
            </div>
          </div>
          <div class="f-grow-3  c-main-card-std-col-3">
            <div class="c-main-card-std-value">
              {{data['master']['amount']}}<span class="c-main-card-precent">%</span>
            </div>
            <div class="c-main-card-std-tip">
              {{data['master']['amountTip']}}
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class="f-grow-2 f-row-list c-main-card-std-split-border">
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner f-col-list f-center">
          <div class="f-grow-2  c-main-card-std-col-4">
            <div class="c-main-card-std-value">
              <img v-show="data['visa']['up'] === true" class="c-main-card-fu-up" src="./assets/up.png" alt="up" />
              <img  v-show="data['visa']['up'] === false" class="c-main-card-fu-up" src="./assets/down.png" alt="down" />
              {{data['visa']['diff']}}<span class="c-main-card-precent">%</span>
            </div>
            <div class="c-main-card-std-tip">
              {{data['visa']['diffTip']}}
            </div>
          </div>
        </div>
      </div>
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner f-col-list f-center">
          <div class="f-grow-2  c-main-card-std-col-4">
            <div class="c-main-card-std-value">
              <img v-show="data['master']['up'] === true" class="c-main-card-fu-up" src="./assets/up.png" alt="up" />
              <img  v-show="data['master']['up'] === false" class="c-main-card-fu-up" src="./assets/down.png" alt="down" />
              {{data['master']['diff']}}<span class="c-main-card-precent">%</span>
            </div>
            <div class="c-main-card-std-tip">
              {{data['master']['diffTip']}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'mainCardTypeD',
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

<style src="./mainCardTypeD.less" lang="less"></style>
