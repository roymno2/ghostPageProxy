<template>
  <div class="app-top flex-row">
    <div class="app-top-left flex-outer">
      <div class="flex-inner">
        <div class="main-logo-container">
          <img src="../../assets/dlbank.svg" alt="" />
        </div>
      </div>
    </div>
    <div class="app-top-right flex-outer">
      <div class="flex-inner flex-row flex-row-left">
        <div class="app-top-clock-container flex-outer">
          <div class="app-header-clock-container">
              <clock :border-color="clockBorderColor"></clock>
            </div>
            <header-area :left="clockStyle[0]" :right="clockStyle[1]" :fill-color="fillColor">
              <digital-clock class="app-top-clock"></digital-clock>
            </header-area>
        </div>
        <div class="app-top-user-container flex-outer">
          <div class="flex-inner">
            <header-area left="TtB" right="C">
              <div class="v-middle-holder">
                <span class="header-icon-holder">
                  <i class="icon-nav-ue" style="margin-left: -0.05rem;"></i>
                </span>
                <span class="header-user-name">{{ userName }}</span>
                <!-- <a class="header-icon-holder header-log-out-btn header-btn global-selection-transition">
                  <i class="icon-log-out"></i>
                </a> -->
              </div>
            </header-area>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import headerArea from '../appHeaderArea/AppHeaderArea'

// import vSelect from '../vueSelect/VueSelect'
import clock from '../clock/Clock'
import digitalClock from '../digitalClock/DigitalClock'
// import dateTimePicker from '../dateTimePicker/DateTimePicker'

// import dataPromise from '../../services/dataPromise'

// import localStore from 'store2'
// import gns from '../../lib/globalNStrings'
export default {
  props: {
    clockStyle: {
      type: Array,
      default () {
        return ['HC', 'TtB']
      }
    },
    mainTitle: {
      type: String
    },
    fillColor: {
      type: String
    },
    clockBorderColor: {
      type: String
    },
    isFirst: {
      type: Number
    }
    // dateTime: {
    //   required: true,
    //   twoWay: true
    // },
    // autoRefreshInterval: {
    //   required: true,
    //   type: Number,
    //   twoWay: true
    // },
    // refresh: {
    //   required: false,
    //   type: Function,
    //   default () {
    //     return function () {}
    //   }
    // },
    // autoRefreshState: {
    //   required: false,
    //   type: Boolean,
    //   twoWay: true,
    //   default: true
    // }
  },
  data () {
    return {
      userName: 'admin'
    }
  },
  computed: {
  },
  components: {
    clock,
    digitalClock,
    headerArea
  },
  compiled () {
  },
  mounted () {
    this.getName()
  },
  methods: {
    getName () {
      let self = this
      this.$service.post(this, 'user', { isFirst: this.isFirst }, true).then((
        userName
      ) => {
        if (userName.state === 0) {
          this.userName = userName.data.user
          this.$emit('update:mainTitle', userName.data.title)
        }
      }, (error) => {
        self.handleError(error)
      })
    }
  },
  watch: {
  }
}
</script>

<style src="./appHeader.less" lang="less"></style>
