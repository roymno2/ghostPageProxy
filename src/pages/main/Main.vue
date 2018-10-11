<template>
  <div class="u-main-container">
    <div class="u-main-header">
      <page-header></page-header>
    </div>
    <div class="u-main-content flex-outer">
      <div class="u-main-content-inside flex-inner">
        <div class="u-main-content-inner f-row-list">
          <div class="f-fix flex-outer c-main-head">

            <el-row>
              <el-col :span="3">
                <el-button size="mini" @click="resetHistory()" type="danger">清除记录</el-button>
                <el-badge :value="proxyRecordNewCount" class="item" :hidden="proxyRecordNewCount === 0">
                  <el-button size="mini" @click="refreshShow()" type="primary">刷新</el-button>
                </el-badge>
              </el-col>
              <el-col :span="4">
              </el-col>
              <el-col :span="4">
                <el-switch size="mini"
                  v-model="showHost"
                  active-text="完整模式"
                  inactive-text="精简模式"
                  active-color="#13ce66"
                  inactive-color="#ccc">
                </el-switch>
              </el-col>
              <el-col :span="4">
                <el-switch size="mini"
                  v-model="showNoProxy"
                  active-text="查看全部"
                  inactive-text="只看转发"
                  active-color="#13ce66"
                  inactive-color="#ccc">
                </el-switch>
              </el-col>
              <el-col :span="4">
                <el-input size="mini" v-model="recordFilterStr"></el-input>
              </el-col>
              <el-col v-if="configInfo" :span="4" style="text-align: right">
                配置的原始主机：{{configInfo.orgHost}} 只会记录此原始主机的请求
              </el-col>
            </el-row>
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
                  <el-table-column  v-if="showHost"
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
                  <el-table-column v-if="showHost"
                                   fixed
                                   width="80"
                                   sortable
                                   prop="orgType"
                                   label="分类">
                  </el-table-column>
                  <el-table-column v-if="showHost"
                    fixed
                    width="80"
                    sortable
                    prop="orgMethod"
                    label="类型">
                  </el-table-column>
                  <el-table-column v-if="showHost"
                    min-width="500"
                    prop="orgPath"
                    sortable
                    label="地址">
                  </el-table-column>
                  <el-table-column v-if="!showHost"
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
                          <span  v-show="props.row.webResponseError ===''" style="color: red">还没有</span>
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
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import pageHeader from '../../components/pageHeader/PageHeader'
export default {
  name: 'Main',
  components: {
    'page-header': pageHeader
  },
  data () {
    return {
      configInfo: null,
      showHost: true,
      showNoProxy: true,
      proxyRecordData: null,
      proxyRecordNew: null,
      proxyRecordOldIdList: [],
      timeShowTimer: null,
      proxyRecordNewCount: 0,
      oldIdList: [],
      recordFilterStr: ''
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
        if (this.proxyRecordData === null) {
          this.proxyRecordData = data
          this.proxyRecordOldIdList = data.map((el) => {
            return el.id
          })
        } else {
          this.proxyRecordNew = data
          this.countNewItem(data)
        }
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
          } else if (this.showNoProxy === false && el.webHost === '[未转发]') {
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

<style src="./main.less" lang="less"></style>
