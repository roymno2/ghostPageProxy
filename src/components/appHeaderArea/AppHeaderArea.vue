<template>
  <div class="app-header-area">
    <div class="app-header-area-left" :class="{'hc': left === 'HC' || left === 'HCBG'}">
      <svg v-if="left === 'BtT'" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 1 h -6 q -4 0, -7 6 l -7 14 q -5 10, 1 10 h 19" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="left === 'TtB'" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 31 h -6 q -4 0, -7 -6 l -7 -14 q -5 -10, 1 -10 h 19" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="left === 'C'" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 1 h -7 a 15 15, 0, 0, 0, 0 30 h 7" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="left === 'HC'" width="100%" height="100%" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="15" fill="none" stroke="inherit" stroke-width="2"></circle>
        <path d="M 48 9 h -6 a 23 23, 0, 1, 0, 0 30 h 6" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="left === 'HCBG'" width="100%" height="100%" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="15" fill="none" stroke="inherit" stroke-width="2"></circle>
        <path d="M 48 9 h -6 a 23 23, 0, 1, 0, 0 30 h 6" :fill="fillColor" :stroke="fillColor" stroke-width="2"></path>
      </svg>
    </div>
    <div class="app-header-area-slot" :style="fillStyle">
      <slot></slot>
    </div>
    <div class="app-header-area-right">
      <svg v-if="right === 'TtB'" class="header-rotate" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 31 h -6 q -4 0, -7 -6 l -7 -14 q -5 -10, 1 -10 h 19" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="right === 'BtT'" class="header-rotate" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 1 h -6 q -4 0, -7 6 l -7 14 q -5 10, 1 10 h 19" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="right === 'C'" class="header-rotate" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 1 h -7 a 15 15, 0, 0, 0, 0 30 h 7" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="right === 'HC'" class="header-rotate" width="100%" height="100%" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="15" fill="none" stroke="inherit" stroke-width="2"></circle>
        <path d="M 48 9 h -6 a 23 23, 0, 1, 0, 0 30 h 6" fill="none" stroke="inherit" stroke-width="2"></path>
      </svg>
      <svg v-if="right === 'CBG'" class="header-rotate" width="100%" height="100%" viewBox="0 0 24 32">
        <path d="M 24 1 h -7 a 15 15, 0, 0, 0, 0 30 h 7" :fill="fillColor" :stroke="fillColor" stroke-width="2"></path>
      </svg>
    </div>
  </div>
</template>
<script>
// import dateTimePicker from '../dateTimePicker/DateTimePicker'

export default {
  props: {
    left: {
      required: false,
      type: String,
      default: 'BtT'
    },
    right: {
      required: false,
      type: String,
      default: 'TtB'
    },
    fillColor: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
    }
  },
  components: {
    // dateTimePicker
  },
  computed: {
    fillStyle () {
      if (this.fillColor) {
        return {
          'background': this.fillColor,
          'borderTop': this.fillColor,
          'borderBottom': this.fillColor
        }
      } else {
        return {}
      }
    }
  },
  compiled () {
  },
  mounted () {
  },
  methods: {
  },
  watch: {
    // 'dateTime': {
    //   handler: function (val, oldVal) {
    //     console.log(val)
    //   },
    //   deep: true
    // }
  }
}
</script>

<style src="./appHeaderArea.less" lang="less"></style>
