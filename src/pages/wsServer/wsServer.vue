<template>
  <div class="u-main-content-inner f-row-list">
    <div class="f-fix" style="height: 50px;">
      <h3>websocket服务端</h3>
    </div>
    <div class="f-fix flex-outer">
      <el-row>
        <el-col>
          <el-form label-width="80px" size="mini">
            <el-form-item label="ws地址">
              请连接 ws://127.0.0.1:8181
            </el-form-item>
            <el-form-item label="功能测试">
              <el-button size="mini" @click="wsServerClose()" type="default">主动断开</el-button>
              <el-button size="mini" @click="clearServerWsHistory()">清除操作记录</el-button>
            </el-form-item>
            <el-form-item label="消息内容">
              <textarea v-model="wsMessage" style="width:98%;min-height: 200px"></textarea>
            </el-form-item>
            <el-form-item label="">
              <el-button size="mini" @click="wsSendToClient()" type="default">发送消息</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
    <div class="f-grow-1 flex-outer" style="border:1px solid #ccc;background-color: #eee;">
      <pre class="flex-inner" style="overflow: auto;">{{wsState}}</pre>
    </div>
  </div>
</template>

<script>
import pageHeader from '../../components/pageHeader/PageHeader'
export default {
  name: 'wsServer',
  components: {
    'page-header': pageHeader
  },
  data () {
    return {
      wsState: '',
      wsMessage: ''
    }
  },
  created () {
  },
  destroyed () {
  },
  mounted () {
    this.getDataTimer()
  },
  methods: {
    clientFresh () {

    },
    clearServerWsHistory () {
      var self = this
      this.$service.post(self, 'clearWsHistory', {}).then(data => {
        this.$message('已清除记录')
      })
    },
    wsServerClose () {
      var self = this
      this.$service.post(self, 'closeWs', {}).then(data => {
        self.$message('服务器端已主动关闭连接')
      })
    },
    wsSendToClient () {
      var self = this
      this.$service.post(self, 'sendWs', {'msg': self.wsMessage}).then(data => {
        self.$message('服务器已发送消息')
      })
    },
    getHistoryData (nextCallback) {
      var self = this
      this.$service.post(self, 'getWsHistory', {}).then(data => {
        this.wsState = data.data
        nextCallback()
      })
    },
    getDataTimer () {
      var self = this
      this.getHistoryData(() => {
        if (this.timeShowTimer !== null) {
          clearTimeout(this.timeShowTimer)
        }
        this.timeShowTimer = setTimeout(() => {
          self.getDataTimer()
        }, 1000)
      })
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

<style src="./wsServer.less" lang="less"></style>
