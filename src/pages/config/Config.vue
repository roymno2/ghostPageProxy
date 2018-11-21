<template>
  <div class="u-main-content-inner">
    <div class="f-row-list">
      <div class="f-fix flex-outer">
        <el-row v-if="config">
          <el-form :model="config" label-width="80px" size="mini">
            <el-form-item>
              <el-button size="mini" @click="readConfig()" type="danger">从文件加载配置</el-button>
              <el-badge is-dot class="item" :hidden="!findDiff">
                <el-button size="mini" @click="saveConfig()" type="primary">保存并应用</el-button>
              </el-badge>
            </el-form-item>
            <el-form-item label="详细记录">
              <el-switch v-if="config"
                         v-model="config.debug"
                         active-color="#13ce66"
                         inactive-color="#ccc">
              </el-switch>
            </el-form-item>
            <el-form-item label="原始主机">
              <el-input size="mini" v-model="config.orgHost" style="width:300px"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input size="mini" v-model="config.webHost" style="width:300px"></el-input>
            </el-form-item>
            <el-form-item label="批量设置cookie">
              <textarea v-model="cookieVal" style="width:100%;min-height: 100px;"></textarea>
              <el-button @click="allCookieDel">删除全部规则的cookie</el-button>
              <el-button @click="allCookieSet" type="primary">设置全部规则的cookie</el-button>
            </el-form-item>
            <el-form-item>
              <el-button @click="addItem()" type="primary" size="mini">添加规则条目</el-button>
            </el-form-item>
          </el-form>
        </el-row>
      </div>
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner">
            <el-table v-if="config" :data="config.proxyList" style="width: 100%" size="mini" border>
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
                label="操作"
                width="160">
                <template slot-scope="scope">
                  <el-button @click="editItem(scope.$index)" type="text" size="small">编辑</el-button>
                  <el-button @click="copyItem(scope.$index)" type="text" size="small">复制</el-button>
                  <el-button @click="deleteItem(scope.$index)" type="text" size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
        </div>
      </div>
    </div>
    <el-dialog :title="editTypeReal" :visible.sync="dialogVisible">
      <el-form v-if=editContent :model="editContent" label-width="130px">
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
        'resStatus': '200',
        'orgUseRe': true,
        'webRewrite': {
          'from': '',
          'to': '',
          'useRe': true
        },
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
    allCookieSet () {
      if (this.config) {
        for (let i = 0; i < this.config.proxyList.length; i++) {
          if (this.config.proxyList[i].hasOwnProperty('webHeader') === false) {
            this.$set(this.config.proxyList[i], 'webHeader', {})
          }
          if (this.config.proxyList[i].webHeader === undefined || this.config.proxyList[i].webHeader === null) {
            this.config.proxyList[i].webHeader = {}
          }
          this.$set(this.config.proxyList[i].webHeader, 'cookie', this.cookieVal)
        }
      }
    },
    allCookieDel () {
      if (this.config) {
        for (let i = 0; i < this.config.proxyList.length; i++) {
          if (this.config.proxyList[i].webHeader !== undefined && this.config.proxyList[i].webHeader !== null) {
            if (this.config.proxyList[i].webHeader.hasOwnProperty('cookie')) {
              this.$delete(this.config.proxyList[i].webHeader, 'cookie')
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
          self.lastLoad = JSON.stringify(data, null, 4)
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
    addItem () {
      this.editIndex = 0
      this.editType = 'add'
      this.editContent = $.extend(true, {}, this.newRule)
      this.dialogVisible = true
    },
    editItem (indexData) {
      console.log(indexData)
      this.editIndex = indexData
      this.editType = 'edit'
      this.editContent = $.extend(true, {}, this.config.proxyList[indexData])
      this.dialogVisible = true
    },
    copyItem (indexData) {
      this.editIndex = indexData
      this.editType = 'copy'
      this.editContent = $.extend(true, {}, this.config.proxyList[indexData])
      this.dialogVisible = true
    },
    editItemSubmit () {
      if (this.editType === 'edit') {
        this.config.proxyList.splice(this.editIndex, 1, this.editContent)
      } else {
        this.config.proxyList.splice(this.config.proxyList.length, 0, this.editContent)
      }
      this.cleanEdit()
    },
    editItemCancel () {
      this.cleanEdit()
    },
    deleteItem (indexData) {
      console.log(indexData)
      var self = this
      this.$confirm('将删除该条目, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        self.config.proxyList.splice(indexData, 1)
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
