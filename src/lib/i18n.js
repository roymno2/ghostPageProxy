import * as routerNames from '../router/routerNames'

export default {
  'en': {
    text: {
    }
  },
  'zh-CN': {
    text: {
      appName: 'ghostPage',
      source: '源',
      target: '目的',
      list: '列表',
      confirm: '确认',
      cancel: '取消',
      sourceList: '@:text.source@:text.list',
      targetList: '@:text.target@:text.list',
      searchPlaceholder: '请输入搜索内容',
      loadingMsg: '正在加载数据',
      noMatchMsg: '未查询到匹配数据～～',
      noDataMsg: '您还没有内容哦，添加内容吧',
      noAccessMsg: 'sorry,您没有权限～～',
      notFoundMsg: '啊哦404了,请点击重试',
      errorMsg: '请求数据失败,请点击重试',
      range: '范围',
      quick: '快捷',
      select: '选择',
      selectSort: '选',
      inverse: '反',
      to: '到',
      quickSelect: '@:text.quick@:text.select',
      inverseSelect: '@:text.inverse@:text.selectSort',
      rangeSelect: '@:text.range@:text.select'
    },
    time: {
      'start': '初',
      'end': '末',
      'Sundays': '日',
      'Mondays': '一',
      'Tuesdays': '二',
      'Wednesdays': '三',
      'Thurdays': '四',
      'Fridays': '五',
      'Saturdays': '六',
      'currentMonth': '本月',
      'currentYear': '今年',
      'every': '每',
      'year': '年',
      'month': '月',
      'week': '周',
      'date': '日',
      'day': '天',
      'prevMonth': '上个月',
      'nextMonth': '下个月',
      'prevYear': '去年',
      'nextYear': '明年',
      'everyDay': '@:time.every@:time.day',
      'everyDate': '@:time.every@:time.date',
      'everyWeek': '@:time.every@:time.week',
      'everyMonth': '@:time.every@:time.month',
      'everyYear': '@:time.every@:time.year',
      'monthEnd': '@:time.month@:time.end',
      relative: {
        recent: '最近',
        minute: '分钟',
        hour: '小时',
        second: '秒'
      },
      byNow: {
        day: '今日',
        week: '本周',
        month: '本月',
        year: '今年'
      },
      text: {
        confirm: '确定',
        custom: '自定义',
        recentUse: '最近使用'
      },
      error: {
        errorParams: '参数错误'
      }
    },
    router: {
      [routerNames.NOTFOUND]: '404',
      [routerNames.MAIN]: '主页',
      [routerNames.ALARM]: '告警'
    },
    alarm: {
      ignore: '忽略',
      intercept: '拦截',
      pending: '待处理'
    }
  }
}
