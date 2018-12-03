<template>
  <div class="u-main-content-inner f-row-list">
    <div class="f-fix flex-outer">
      <el-row v-if="config">
        <el-form :model="config" label-width="0px" size="mini">
          <el-form-item>
            <el-button size="mini" @click="readConfig()" type="danger">从文件加载配置</el-button>
            <el-badge is-dot class="item" :hidden="!findDiff">
              <el-button size="mini" @click="saveConfig()" type="primary">保存并应用</el-button>
            </el-badge>
            <el-button size="mini" @click="downloadConfig()" type="default" style="margin-left:20px;">下载配置文件</el-button>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
    <div class="f-fix" v-if="config">
      <el-tabs v-model="editableTabsValue" type="card" editable @edit="handleTabsEdit" style="height: 100%">
        <el-tab-pane
          v-for="(item, hostId) in config.hostSetting"
          :label="(item.orgHost === '' && item.comment === '') ? '未命名' : item.orgHost + ' ' + item.comment"
          :key="hostId"
          :name="hostId + ''"
        >
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="f-grow-1 flex-outer" v-if="config">
      <div class="flex-inner" style="overflow: auto" v-for="(item, hostId) in config.hostSetting" :key="hostId">
        <div class="" v-show="hostId === Number(editableTabsValue)">
          <el-form size="mini" label-width="150px">
            <el-form-item label="描述">
              <el-input size="mini" v-model="item.comment" style="width:300px"></el-input>
            </el-form-item>
            <el-form-item label="原始主机">
              <el-input size="mini" v-model="item.orgHost" style="width:300px"></el-input>
            </el-form-item>
            <el-form-item label="转发主机">
              <el-input size="mini" v-model="item.webHost" style="width:300px"></el-input>
            </el-form-item>
            <el-form-item label="启动配置">
              <el-switch v-if="item"
                         v-model="item.enableHost"
                         active-color="#13ce66"
                         inactive-color="#ccc">
              </el-switch>
            </el-form-item>
            <el-form-item label="详细记录">
              <el-switch v-if="item"
                       v-model="item.debug"
                       active-color="#13ce66"
                       inactive-color="#ccc">
              </el-switch>
            </el-form-item>
            <el-form-item label="批量设置cookie">
              <div class="f-row-list">
                <textarea v-model="item.cookieVal" style="width:90%;height: 100px;"></textarea>
                <div class="f-grow-0">
                  <el-button size="mini" @click="allCookieDel(hostId)">删除全部规则的cookie</el-button> <el-button @click="allCookieSet(hostId)" size="mini" type="primary">设置全部规则的cookie</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button @click="addItem(hostId)" type="primary" size="mini">添加规则条目</el-button>
            </el-form-item>
          </el-form>
          <el-table v-if="item" :data="item.proxyList" style="width: 100%" size="mini" border>
            <el-table-column
              fixed
              type="index"
              width="80"
              label="序号">
            </el-table-column>
            <el-table-column
              fixed
              width="120"
              prop="orgMethod"
              label="Method限制">
              <template slot-scope="scope">
                {{scope.row.orgMethod ? scope.row.orgMethod : '不限'}}
              </template>
            </el-table-column>
            <el-table-column
              label="匹配路径"
              prop="orgPath">
            </el-table-column>
            <el-table-column
              label="header">
              <template slot-scope="scope" v-if="scope.row.webHeader !== null && scope.row.webHeader !== undefined">
                <pre>{{JSON.stringify(scope.row.webHeader, null, 4)}}</pre>
              </template>
            </el-table-column>
            <el-table-column
              label="替换路径"
              prop="orgPath">
              <template slot-scope="scope">
                <span v-show="scope.row.webRewrite.from !== '' || scope.row.webRewrite.to !== ''">
                  {{scope.row.webRewrite.from + ' -> ' + scope.row.webRewrite.to}}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="是否启动"
              width="80"
              prop="orgPath">
              <template slot-scope="scope">
                <span :style="{'color': scope.row.enable === true ? 'green' : 'red', 'font-weight': 'bold'}">{{scope.row.enable === true ? '启用' : '停用'}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="250">
              <template slot-scope="scope">
                <el-button-group>
                  <el-button @click="editItem(hostId, scope.$index)" icon="el-icon-edit" type="primary" size="mini" title="编辑"></el-button>
                  <el-button @click="deleteItem(hostId, scope.$index)" icon="el-icon-delete" type="danger" size="mini" title="删除"></el-button>
                  <el-button @click="copyItem(hostId, scope.$index)" icon="el-icon-share" type="default" size="mini" title="复制"></el-button>
                </el-button-group>
                <el-button-group>
                  <el-button @click="moveItemUp(hostId, scope.$index)" icon="el-icon-caret-top" type="default" size="mini" title="向上"></el-button>
                  <el-button @click="moveItemDown(hostId, scope.$index)" icon="el-icon-caret-bottom" type="default" size="mini" title="向下"></el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <el-dialog :title="editTypeReal" :visible.sync="dialogVisible">
      <el-form size="mini" v-if=editContent :model="editContent" label-width="130px">
        <el-form-item label="Method限制">
          <el-select v-model="editContent.orgMethod" filterable placeholder="请选择">
            <el-option
              v-for="item in methodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="原始路径">
          <el-input v-model="editContent.orgPath" placeholder="必填，^/xx 请填写正则表达式"></el-input>
        </el-form-item>
        <el-form-item label="返回码指定">
          <el-select v-model="editContent.resStatus" placeholder="请选择">
            <el-option label="自动" value="0"></el-option>
            <el-option label="200" value="200"></el-option>
            <el-option label="404" value="404"></el-option>
            <el-option label="500" value="500"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转发路径把什么替换成什么">
          <el-input v-model="editContent.webRewrite.from" placeholder="可选，请填写正则"></el-input>
          <el-input v-model="editContent.webRewrite.to" placeholder="可选，请填写替换内容"></el-input>
        </el-form-item>
        <el-form-item label="webHeader定义">
          <el-button type="primary" @click="addCookie">添加cookie</el-button>
          <el-input v-if="editContent.webHeader && editContent.webHeader.cookie !== undefined" v-model="editContent.webHeader.cookie" placeholder="cookie"></el-input>
          <el-button v-if="editContent.webHeader && editContent.webHeader.cookie !== undefined" type="danger" @click="delCookie">删除cookie</el-button>
        </el-form-item>
        <el-form-item label="启用此条">
          <el-switch v-model="editContent.enable"
                     active-color="#13ce66"
                     inactive-color="#ccc">
          </el-switch>
        </el-form-item>
        <el-form-item label="自定义假数据">
          <el-switch v-model="editContent.useFake"
                     active-color="#13ce66"
                     inactive-color="#ccc">
          </el-switch>
        </el-form-item>
        <el-form-item v-show="editContent.useFake === true">
          <textarea v-model="editContent.resContent" style="width: 500px; height: 300px;"></textarea>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="editItemSubmit">确定</el-button>
          <el-button @click="editItemCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import $ from 'jquery'
import pageHeader from '../../components/pageHeader/PageHeader'
export default {
  name: 'config',
  components: {
    'page-header': pageHeader
  },
  data () {
    return {
      hostId: 0,
      editableTabsValue: '0',
      cookieVal: '',
      findDiff: false,
      config: null,
      editContent: null,
      editIndex: null,
      editType: null,
      dialogVisible: false,
      newRule: {
        'orgMethod': '',
        'orgPath': '',
        'resStatus': '0',
        'orgUseRe': true,
        'enable': true,
        'webRewrite': {
          'from': '',
          'to': '',
          'useRe': true
        },
        useFake: false,
        resContent: '',
        'webHeader': {}
      },
      methodOptions: [
        {
          label: '不限',
          value: ''
        },
        {
          label: 'GET',
          value: 'GET'
        },
        {
          label: 'POST',
          value: 'POST'
        },
        {
          label: 'PUT',
          value: 'PUT'
        },
        {
          label: 'DELETE',
          value: 'DELETE'
        }
      ]
    }
  },
  created () {
  },
  destroyed () {
  },
  mounted () {
    this.readConfig()
  },
  methods: {
    moveItemUp (hostId, indexData) {
      console.log(indexData)
      if (indexData > 0) {
        let tmpData = this.config.hostSetting[Number(hostId)].proxyList.splice(indexData, 1)
        this.config.hostSetting[Number(hostId)].proxyList.splice(indexData - 1, 0, tmpData[0])
      } else {
        this.$message('已经到列表顶端')
      }
    },
    moveItemDown (hostId, indexData) {
      console.log(indexData)
      if (indexData < this.config.hostSetting[Number(hostId)].proxyList.length - 1) {
        let tmpData = this.config.hostSetting[Number(hostId)].proxyList.splice(indexData, 1)
        this.config.hostSetting[Number(hostId)].proxyList.splice(indexData + 1 , 0, tmpData[0])
      } else {
        this.$message('已经到列表尾部')
      }
    },
    handleTabsEdit (targetName, action) {
      if (action === 'add') {
        this.config.hostSetting.push({
          'comment': '',
          'orgHost': '',
          'webHost': '',
          'enableHost': true,
          'debug': false,
          'cookieVal': '',
          'proxyList': []
        })
      }
      if (action === 'remove') {
        var self = this
        this.$confirm('将删除该主机配置, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          self.config.hostSetting.splice(Number(targetName), 1)
          if (self.config.hostSetting.length > 0) {
            this.editableTabsValue = '0'
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    downloadConfig () {
      let tmpTime = new Date()
      let nowTime = tmpTime.getFullYear() + '-' + (parseInt(tmpTime.getMonth()) + 1) + '-' + tmpTime.getDate() + '_' + tmpTime.getHours() + '-' + tmpTime.getMinutes() + '-' + tmpTime.getSeconds()
      let routeUrl = this.$router.resolve({
        path: '/api/downloadConfig',
        query: {name: nowTime}
      })
      window.open(routeUrl.href, '_blank')
    },
    allCookieSet (hostId) {
      if (this.config) {
        for (let i = 0; i < this.config.hostSetting[Number(hostId)].proxyList.length; i++) {
          if (this.config.hostSetting[Number(hostId)].proxyList[i].hasOwnProperty('webHeader') === false) {
            this.$set(this.config.hostSetting[Number(hostId)].proxyList[i], 'webHeader', {})
          }
          if (this.config.hostSetting[Number(hostId)].proxyList[i].webHeader === undefined || this.config.hostSetting[Number(hostId)].proxyList[i].webHeader === null) {
            this.config.hostSetting[Number(hostId)].proxyList[i].webHeader = {}
          }
          this.$set(this.config.hostSetting[Number(hostId)].proxyList[i].webHeader, 'cookie', this.cookieVal)
        }
      }
    },
    allCookieDel (hostId) {
      if (this.config) {
        for (let i = 0; i < this.config.hostSetting[Number(hostId)].proxyList.length; i++) {
          if (this.config.hostSetting[Number(hostId)].proxyList[i].webHeader !== undefined && this.config.hostSetting[Number(hostId)].proxyList[i].webHeader !== null) {
            if (this.config.hostSetting[Number(hostId)].proxyList[i].webHeader.hasOwnProperty('cookie')) {
              this.$delete(this.config.hostSetting[Number(hostId)].proxyList[i].webHeader, 'cookie')
            }
          }
        }
      }
    },
    addCookie () {
      if (this.editContent.hasOwnProperty('webHeader') === false) {
        this.$set(this.editContent, 'webHeader', {})
      }
      if (this.editContent.webHeader === undefined || this.editContent.webHeader === null) {
        this.editContent.webHeader = {}
      }
      this.editContent.webHeader['cookie'] = ''
    },
    delCookie () {
      this.$delete(this.editContent.webHeader, 'cookie')
    },
    readConfig () {
      var self = this
      self.$service.post(self, 'readConfig', {}).then((data) => {
        try {
          self.config = JSON.parse(data)
          self.$message({
            type: 'success',
            message: '加载完成'
          })
          console.log(self.config)
        } catch (e) {
          self.$message({
            message: '加载失败',
            type: 'error'
          })
        }
      })
    },
    saveConfig () {
      var self = this
      let outName = {}
      for (let i = 0; i < self.config.hostSetting.length; i++) {
        if (outName.hasOwnProperty(self.config.hostSetting[i].orgHost) === false) {
          outName[self.config.hostSetting[i].orgHost] = true
        } else {
          this.$message({
            type: 'error',
            message: '原始主机' + self.config.hostSetting[i].orgHost + '存在多份配置，拒绝保存'
          })
          return false
        }
      }
      self.$service.post(self, 'saveConfig', self.config).then((data) => {
        if (data === true) {
          this.findDiff = false
          self.$message({
            message: '保存成功',
            type: 'success'
          })
        }
      })
    },
    addItem (hostId) {
      this.hostId = hostId
      this.editIndex = 0
      this.editType = 'add'
      this.editContent = $.extend(true, {}, this.newRule)
      this.dialogVisible = true
    },
    editItem (hostId, indexData) {
      this.hostId = hostId
      this.editIndex = indexData
      this.editType = 'edit'
      this.editContent = $.extend(true, {}, this.config.hostSetting[Number(this.hostId)].proxyList[indexData])
      this.dialogVisible = true
    },
    copyItem (hostId, indexData) {
      this.hostId = hostId
      this.editIndex = indexData
      this.editType = 'copy'
      this.editContent = $.extend(true, {}, this.config.hostSetting[Number(this.hostId)].proxyList[indexData])
      this.dialogVisible = true
    },
    editItemSubmit () {
      if (this.editType === 'edit') {
        this.config.hostSetting[Number(this.hostId)].proxyList.splice(this.editIndex, 1, this.editContent)
      } else {
        this.config.hostSetting[Number(this.hostId)].proxyList.splice(this.config.hostSetting[Number(this.hostId)].proxyList.length, 0, this.editContent)
      }
      this.cleanEdit()
    },
    editItemCancel () {
      this.cleanEdit()
    },
    deleteItem (hostId, indexData) {
      this.hostId = hostId
      var self = this
      this.$confirm('将删除该条目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        self.config.hostSetting[Number(this.hostId)].proxyList.splice(indexData, 1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    cleanEdit () {
      this.editContent = null
      this.editIndex = null
      this.editType = null
      this.dialogVisible = false
      this.findDiff = true
    }
  },
  beforeDestroy () {
  },
  computed: {
    editTypeReal () {
      if (this.editType === 'edit') {
        return '编辑规则'
      } else if (this.editType === 'copy') {
        return '复制规则'
      } else if (this.editType === 'add') {
        return '新增规则'
      } else {
        return ''
      }
    }
  },
  watch: {
  }
}
</script>

<style src="./config.less" lang="less"></style>
