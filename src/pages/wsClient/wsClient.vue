<template>
  <div class="u-main-content-inner f-row-list">
    <div class="f-fix" style="height: 50px;">
      <h3>websocket客户端</h3>
    </div>
    <div class="f-fix flex-outer">
      <el-row>
        <el-col>
          <el-form label-width="80px" size="mini">
            <el-form-item label="ws地址">
              <el-input v-model="wsAddress" size="mini" placeholder="ws://127.0.0.1:8080/xxx"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button size="mini" @click="wsStart()" type="primary">连接</el-button>
              <el-button size="mini" @click="wsClose()" type="danger">断开</el-button>
              <el-button size="mini" @click="clearClientWsHistory()" type="default">清除操作记录</el-button>
            </el-form-item>
            <el-form-item label="消息内容">
              <textarea v-model="wsMessage" style="width:98%;min-height: 200px"></textarea>
            </el-form-item>
            <el-form-item label="">
              <el-button size="mini" @click="wsSend()" type="default">发送消息</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>
    <div class="f-grow-1 flex-outer" style="border:1px solid #ccc;background-color: #eee; overflow: auto;">
      <pre class="flex-inner" style="overflow: auto;">{{wsState}}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'wsClient',
  components: {
  },
  data () {
    return {
      wsAddress: 'ws://127.0.0.1:8181',
      wsMessage: '',
      wsState: '',
      websocket: undefined
    }
  },
  created () {
  },
  destroyed () {
  },
  mounted () {
  },
  methods: {
    wsStart () {
      var self = this
      let wsUri = this.wsAddress
      this.websocket = new WebSocket(wsUri)
      this.websocket.onopen = () => {
        self.wsState = self.wsState + '连接成功\n'
      }
      this.websocket.onclose = () => {
        self.wsState = self.wsState + 'websocket连接已断开\n'
        this.websocket.close()
      }
      this.websocket.onmessage = (evt) => {
        self.wsState = self.wsState + '服务端回应:\n' + String(evt.data) + '\n'
      }
      this.websocket.onerror = () => {
        self.wsState = self.wsState + '发生错误\n'
      }
    },
    wsClose () {
      if (this.websocket !== undefined) {
        try {
          this.websocket.close()
        } catch (e) {
        }
      }
    },
    wsSend () {
      if (this.wsMessage === '') {
        this.$message('请先填写发送信息')
      } else {
        if (this.websocket === 'undefined') {
          this.$message('websocket还没有连接，或者连接失败，请检测')
        } else {
          if (this.websocket.readyState === 3) {
            this.$message('websocket已经关闭，请重新连接')
          } else {
            this.websocket.send(this.wsMessage)
            this.wsState = this.wsState + '发送消息：' + this.wsMessage + '\n'
          }
        }
      }
    },
    clearClientWsHistory () {
      this.wsState = ''
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

<style src="./wsClient.less" lang="less"></style>
