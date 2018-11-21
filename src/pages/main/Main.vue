<template>
  <div class="u-main-container">
    <div class="u-main-content f-row-list">
      <div class="f-grow-0 c-main-tabs flex-outer">
        <div class="flex-inner" style="top: 20px;left: 20px;right: 20px">
          <el-tabs class="flex-inner" v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="代理配置" name="first"></el-tab-pane>
            <el-tab-pane label="代理历史" name="second"></el-tab-pane>
            <el-tab-pane label="websocket测试" name="third"></el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner">
          <config v-show="activeName === 'first'"></config>
          <history v-show="activeName === 'second'"></history>
          <div class="f-height-full f-col-list" v-if="activeName === 'third'">
            <div class="f-grow-1 flex-outer">
              <div class="flex-inner">
                <ws-client ></ws-client>
              </div>
            </div>
            <div class="f-grow-0" style="width:10px;">
            </div>
            <div class="f-grow-1 flex-outer">
              <div class="flex-inner">
                <ws-server></ws-server>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import history from '../history/history'
import config from '../config/config'
import wsClient from '../wsClient/wsClient'
import wsServer from '../wsServer/wsServer'
export default {
  name: 'Main',
  components: {
    'history': history,
    'config': config,
    'ws-client': wsClient,
    'ws-server': wsServer
  },
  data () {
    return {
      activeName: 'first'
    }
  },
  created () {
  },
  destroyed () {
  },
  mounted () {
  },
  methods: {
    handleClick (val) {
      console.log(val)
    }
  },
  beforeDestroy () {
  },
  computed: {
  },
  watch: {
  }
}
</script>

<style src="./main.less" lang="less"></style>
