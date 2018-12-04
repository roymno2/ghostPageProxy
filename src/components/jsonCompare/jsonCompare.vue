<template>
  <div class="f-height-full f-row-list u-main-top">
    <div class="f-grow-0 c-head-top">
      <el-button  @click="showDiff" size="mini">显示不同</el-button> <el-button @click="formatJson" type="primary" size="mini">格式化json</el-button>
    </div>
    <div class="f-grow-0 c-head-top-result">
      <div>比较结果：<span :style="{'color': resultColor}">{{result}}</span></div>
    </div>
    <div class="f-grow-0 c-head-top-detail">
      <div>不同之处(一次只显示一个错误)：<p style="font-family: initial;max-height: 300px;overflow: auto;box-shadow: 0px 0px 2px 1px #ccc" v-html="desp"></p></div>
    </div>
    <div class="f-grow-1 f-col-list">
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner f-row-list">
          <div class="f-grow-0 c-info" :style="{'color': leftInfo !== '合法' && leftInfo !== '' ? 'red': undefined}">左边{{leftInfo}}</div>
          <div class="f-grow-1 flex-outer">
            <textarea class="flex-inner f-width-full c-main-textarea" v-model="leftData">
            </textarea>
          </div>
        </div>
      </div>
      <div class="f-grow-1 flex-outer">
        <div class="flex-inner f-row-list">
          <div class="f-grow-0 c-info" :style="{'color': rightInfo !== '合法' &&  rightInfo !== '' ? 'red': undefined}">右边{{rightInfo}}</div>
          <div class="f-grow-1 flex-outer">
            <textarea class="flex-inner f-width-full c-main-textarea" v-model="rightData">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import CompareAnyController from './libCompareAdv'
export default {
  name: 'jsonCompare',
  components: {
  },
  data () {
    return {
      leftData: '',
      rightData: '',
      leftInfo: '',
      rightInfo: '',
      result: '',
      desp: '',
      resultColor: '#ccc'
    }
  },
  created () {
  },
  destroyed () {
  },
  mounted () {
    this.compareJson()
  },
  methods: {
    showDiff () {
      alert(this.desp)
    },
    formatJson () {
      let tmpLeftData = null
      let tmpRightData = null
      if ($.trim(this.leftData) !== '') {
        try {
          tmpLeftData = JSON.parse(this.leftData)
          this.leftData = JSON.stringify(tmpLeftData, null, 4)
        } catch (e) {
          this.leftInfo = '不是json'
          console.log(e)
        }
      }
      if ($.trim(this.rightData) !== '') {
        try {
          tmpRightData = JSON.parse(this.rightData)
          this.rightData = JSON.stringify(tmpRightData, null, 4)
        } catch (e) {
          console.log(e)
          this.rightInfo = '不是json'
        }
      }
    },
    compareJson () {
      if ($.trim(this.leftData) !== '' && $.trim(this.rightData) !== '') {
        let formatFlag = 0
        let tmpLeftData = null
        let tmpRightData = null
        try {
          tmpLeftData = JSON.parse(this.leftData)
          // this.leftData = JSON.stringify(tmpLeftData, null, 4)
          formatFlag = formatFlag + 1
          this.leftInfo = '合法'
        } catch (e) {
          this.leftInfo = '不是json'
          console.log(e)
        }
        try {
          tmpRightData = JSON.parse(this.rightData)
          // this.rightData = JSON.stringify(tmpRightData, null, 4)
          formatFlag = formatFlag + 1
          this.rightInfo = '合法'
        } catch (e) {
          console.log(e)
          this.rightInfo = '不是json'
        }
        if (formatFlag === 2) {
          console.log(tmpLeftData)
          console.log(tmpRightData)
          let cc = new CompareAnyController()
          if (cc.compareAnyData(tmpLeftData, tmpRightData) === true) {
            this.result = '一致'
            this.resultColor = 'blue'
            this.desp = ''
          } else {
            this.result = '不一致'
            this.resultColor = 'red'
            this.desp = cc.getDiff()
          }
        } else {
          this.result = '数据不合法'
          this.resultColor = 'red'
        }
      } else {
        this.result = '数据不合法'
        this.resultColor = '#ccc'
        this.desp = ''
        if ($.trim(this.leftData) === '') {
          this.leftInfo = '内容为空'
        } else {
          this.leftInfo = ''
        }
        if ($.trim(this.rightData) === '') {
          console.log('rightData 内容为空')
          this.rightInfo = '内容为空'
        } else {
          this.rightInfo = ''
        }
      }
    }
  },
  computed: {
  },
  beforeDestroy () {
  },
  watch: {
    leftData: function (val, oldval) {
      this.compareJson()
    },
    rightData: function (val, oldval) {
      this.compareJson()
    }
  }
}
</script>

<style src="./jsonCompare.less" lang="less"></style>
