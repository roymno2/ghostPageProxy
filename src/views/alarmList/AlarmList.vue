<template>
  <div class="alarm-list-container">
    <div class="alarm-list-tools-bar">
      <el-button size="mini" @click.native="selectAll">全选</el-button>
      <el-button size="mini" @click.native="clearSelect">清空</el-button>
      <el-button size="mini" @click.native="toggleSelect">反选</el-button>
      <el-dropdown size="mini" split-button type="primary">
        {{ $t('alarm.intercept') }}
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>{{ $t('alarm.pending') }}</el-dropdown-item>
          <el-dropdown-item>{{ $t('alarm.ignore') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="alarm-list-table">
      <el-table ref="alarmTable" :data="rows" tooltip-effect="dark" style="width: 100%" stripe @selection-change="handleSelectionChange">
        <el-table-column width="4" class-name="alarm-list-alarm-color-container">
          <template slot-scope="scope">
            <div class="alarm-list-alarm-color" :style="'background-color: ' + alarmColor[scope.row.level]">{{ scope.row.level }}</div>
          </template>
        </el-table-column>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="时间" sortable width="150" prop="time">
        </el-table-column>
        <el-table-column label="交易卡号" show-overflow-tooltip prop="cardId" width="150"></el-table-column>
        <el-table-column label="交易金额" show-overflow-tooltip prop="transAmount"></el-table-column>
        <el-table-column label="触碰规则" show-overflow-tooltip prop="rule"></el-table-column>
        <el-table-column label="交易返回码" show-overflow-tooltip prop="returnCode"></el-table-column>
        <el-table-column label="交易渠道" show-overflow-tooltip prop="transBy"></el-table-column>
        <el-table-column label="银行上送订单号" show-overflow-tooltip prop="itemId"></el-table-column>
        <el-table-column label="处理状况" width="100">
          <template slot-scope="scope">
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                {{ $t('alarm.' + scope.row.status) }}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>{{ $t('alarm.pending') }}</el-dropdown-item>
                <el-dropdown-item>{{ $t('alarm.intercept') }}</el-dropdown-item>
                <el-dropdown-item>{{ $t('alarm.ignore') }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" size="medium">详情</el-button>
              <el-button type="text" size="medium">分析</el-button>
            </template>
          </el-table-column>
      </el-table>
    </div>
    <div class="alarm-list-pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 50, 200, 400]"
        :page-size="10"
        layout="total, prev, pager, next, sizes, jumper"
        :total="400">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AlarmList',
  props: {
    rows: {
      required: false,
      type: Array,
      default () {
        return []
      }
    },
    alarmColor: {
      required: false,
      type: Array,
      default  () {
        return []
      }
    },
    columns: {
      required: false,
      type: Array,
      default () {
        return []
      }
    },
    currentPage: {
      required: false,
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    }
  },
  methods: {
    handleSelectionChange (val) {
    },
    handleSizeChange (val) {
    },
    handleCurrentChange (val) {
    },
    toggleSelect () {
      this.$refs.alarmTable.toggleAllSelection()
    },
    selectAll () {
      this.rows.forEach(row => {
        this.$refs.alarmTable.toggleRowSelection(row, true)
      })
    },
    clearSelect () {
      this.$refs.alarmTable.clearSelection()
    }
  }
}
</script>

<style src="./alarmList.less" lang="less"></style>
