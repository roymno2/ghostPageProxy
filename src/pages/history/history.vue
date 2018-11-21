<template>
  <div class="u-main-content-inner f-row-list">
    <div class="f-fix f-row-list">
      <div class="f-grow-0 f-height-form f-col-list">
        <div class="f-grow-0 flex-outer f-padding-right-std">
          <el-button size="mini" @click="resetHistory()" type="danger">清除记录</el-button>
          <el-badge :value="proxyRecordNewCount" class="item" :hidden="proxyRecordNewCount === 0">
            <el-button size="mini" @click="refreshShow()" type="primary">刷新记录</el-button>
          </el-badge>
        </div>
        <div class="f-grow-0 f-padding-left-std f-text-form-line-height">
          过滤请求路径：
        </div>
        <div class="f-grow-1 flex-outer">
          <div class="flex-inner">
            <el-input size="mini" v-model="recordFilterStr"></el-input>
          </div>
        </div>
      </div>
      <div class="f-grow-0 f-height-form f-col-list">
        <div class="f-grow-0 f-padding-right-std">
          <el-switch size="mini"
                     v-model="hideHost"
                     active-text="精简模式"
                     active-color="#13ce66"
                     inactive-color="#ccc">
          </el-switch>
        </div>
        <div class="f-grow-0 f-padding-right-std">
          <el-switch size="mini"
                     v-model="onlyProxy"
                     active-text="仅看转发"
                     active-color="#13ce66"
                     inactive-color="#ccc">
          </el-switch>
        </div>
        <div class="f-grow-1 f-padding-left-std" v-if="configInfo" style="text-align: right">
          附加说明：系统只会记录原始主机为{{configInfo.orgHost}}的请求，记录更新时间 {{loadTime}}
        </div>
      </div>
    </div>
    <div class="f-grow-1 flex-outer">
      <div class="flex-inner">
          <el-table v-if="realList" :data="realList" height="100%" style="width: 100%" size="mini" border :row-class-name="tableRowClassName" @expand-change="expandChangeHandler">
            <el-table-column
              fixed
              prop="id"
              width="80"
              sortable
              label="序号">
            </el-table-column>
            <el-table-column  v-if="hideHost"
              fixed
              prop="time"
              width="140"
              label="时间">
            </el-table-column>
            <el-table-column
              prop="orgHost"
              label="主机"
              width="150">
            </el-table-column>
            <el-table-column v-if="hideHost"
                             fixed
                             width="80"
                             sortable
                             prop="orgType"
                             label="分类">
            </el-table-column>
            <el-table-column v-if="hideHost"
              fixed
              width="80"
              sortable
              prop="orgMethod"
              label="类型">
            </el-table-column>
            <el-table-column v-if="hideHost"
              min-width="500"
              prop="orgPath"
              sortable
              label="地址">
            </el-table-column>
            <el-table-column v-if="!hideHost"
              min-width="500"
              prop="orgPathWithMethod"
              sortable
              label="地址">
            </el-table-column>
            <el-table-column
              prop="webHostLite"
              width="300"
              label="web发送路径">
            </el-table-column>
            <el-table-column type="expand">
              <template slot-scope="props">
                <el-form label-position="left">
                  <el-form-item label="是否收集到响应结果" v-show="props.row.webHost !== '[未转发]'">
                    <span  v-show="props.row.webResponseError ===''" style="color: red">{{configInfo.debug === true ? '还没有': '未启用详细记录'}}</span>
                    <span v-show="props.row.webResponseError !==''" style="color: blue">已收集完成</span>
                  </el-form-item>
                  <el-form-item label="转发错误" v-show="props.row.webHost !== '[未转发]'">
                    <span>{{ props.row.webResponseError }}</span>
                  </el-form-item>
                  <el-form-item label="web发送路径" v-show="props.row.webHost !== '[未转发]'">
                    <span>{{ props.row.webHost }}</span>
                  </el-form-item>
                  <el-form-item label="[原始]返回码" v-show="props.row.webHost !== '[未转发]'">
                    <span>{{ props.row.orgResponseStatusCode }}</span>
                  </el-form-item>
                  <el-form-item label="转发返回码" v-show="props.row.webHost !== '[未转发]'">
                    <span>{{ props.row.webResponseStatusCode }}</span>
                  </el-form-item>
                  <el-form-item label="最终返回码" v-show="props.row.webHost !== '[未转发]'">
                    <span>{{ props.row.finResponseStatusCode }}</span>
                  </el-form-item>
                  <el-form-item label="[原始]请求头" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><pre>{{ props.row.orgRequestHeader }}</pre></div>
                  <el-form-item label="转发请求头" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><pre>{{ props.row.webRequestHeader }}</pre></div>
                  <el-form-item label="[原始]返回头" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><pre>{{ props.row.orgResponseHeader }}</pre></div>
                  <el-form-item label="转发返回头" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><pre>{{ props.row.webResponseHeader }}</pre></div>
                  <el-form-item label="最终返回头" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><pre>{{ props.row.finResponseHeader }}</pre></div>
                  <el-form-item label="[原始]返回内容" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><span>{{ props.row.orgResponseContent }}</span></div>
                  <el-form-item label="转发返回内容" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><span>{{ props.row.webResponseContent }}</span></div>
                  <el-form-item label="[原始]请求payload" v-show="props.row.webHost !== '[未转发]'">
                  </el-form-item>
                  <div class="c-main-forward-cell"><span>{{ props.row.orgPayload }}</span></div>
                </el-form>
              </template>
            </el-table-column>
          </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import moment from 'moment'
import pageHeader from '../../components/pageHeader/PageHeader'
export default {
  name: 'history',
  components: {
    'page-header': pageHeader
  },
  data () {
    return {
      configInfo: null,
      hideHost: true,
      onlyProxy: true,
      proxyRecordData: null,
      proxyRecordNew: null,
      proxyRecordOldIdList: [],
      timeShowTimer: null,
      proxyRecordNewCount: 0,
      oldIdList: [],
      recordFilterStr: '',
      loadTime: ''
    }
  },
  created () {
  },
  destroyed () {
    if (this.timeShowTimer !== null) {
      clearTimeout(this.timeShowTimer)
    }
  },
  mounted () {
    console.log(this.$route)
    this.readConfig()
    this.getDataTimer()
  },
  methods: {
    expandChangeHandler (row) {
      for (let i = 0; i < this.proxyRecordData.length; i++) {
        if (this.proxyRecordData[i].id === row.id && row.webResponseError === '') {
          this.refreshRecordCell(row.id, i)
        }
      }
    },
    refreshRecordCell (row, indexId) {
      let cellId = row.id
      if (row.webResponseError === '') {
        const self = this
        var replaceFlag = false
        self.$service.post(self, 'getHistory', {}).then((data) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i].id === cellId) {
              self.proxyRecordData.splice(indexId, 1, data[i])
              replaceFlag = true
              break
            }
          }
          if (replaceFlag === false) {
            self.$message({
              message: '记录单元更新失败',
              type: 'error'
            })
          }
        })
      }
    },
    readConfig () {
      var self = this
      self.$service.post(self, 'readConfig', {}).then((data) => {
        try {
          self.configInfo = JSON.parse(data)
        } catch (e) {
          self.$message({
            message: '配置加载失败',
            type: 'error'
          })
        }
      })
    },
    tableRowClassName ({row, rowIndex}) {
      if (row.webHostLite !== '[未转发]') {
        return 'success-row'
      }
      return ''
    },
    getDataTimer () {
      var self = this
      this.getHistoryData(() => {
        if (this.timeShowTimer !== null) {
          clearTimeout(this.timeShowTimer)
        }
        this.timeShowTimer = setTimeout(() => {
          self.getDataTimer()
        }, 2000)
      })
    },
    resetHistory () {
      var self = this
      self.$service.post(self, 'resetHistory', {}).then((data) => {
        this.proxyRecordData = null
        this.proxyRecordNew = null
        this.proxyRecordOldIdList = []
      })
    },
    getHistoryData (callback) {
      let self = this
      self.$service.post(self, 'getHistory', {}).then((data) => {
        if (self.proxyRecordData === null) {
          self.proxyRecordData = data
          self.proxyRecordOldIdList = data.map((el) => {
            return el.id
          })
        } else {
          self.proxyRecordNew = data
          self.countNewItem(data)
        }
        self.loadTime = moment(new Date()).format('hh:mm:ss')
        if (callback) {
          callback()
        }
      })
    },
    refreshShow () {
      this.proxyRecordOldIdList = this.proxyRecordNew.map((el) => {
        return el.id
      })
      this.proxyRecordData = this.proxyRecordNew
    },
    countNewItem (data) {
      let tmpList = []
      let newCount = 0
      for (let i = 0; i < data.length; i++) {
        if (this.proxyRecordOldIdList.indexOf(data[i].id) === -1) {
          newCount = newCount + 1
        }
        tmpList.push(data[i].id)
      }
      this.proxyRecordNewCount = newCount
    }
  },
  beforeDestroy () {
  },
  computed: {
    realList: function () {
      let tmpRecordFilterStr = $.trim(this.recordFilterStr)
      if (this.proxyRecordData) {
        return this.proxyRecordData.filter(el => {
          if ($.trim(this.recordFilterStr) !== '' && el.orgPath.indexOf(tmpRecordFilterStr) === -1) {
            return false
          } else if (this.onlyProxy === true && el.webHost === '[未转发]') {
            return false
          } else {
            return true
          }
        })
      } else {
        return null
      }
    }
  },
  watch: {
  }
}
</script>

<style src="./history.less" lang="less"></style>
