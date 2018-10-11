// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import EzService from './service/ezService'
import allUserConfig from '../config/user'

import App from './App'
import store from './store'
import routerFactory from './router'
import i18nMessage from './lib/i18n'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

const APPNAME = 'ghostPage'

Vue.use(ElementUI)

window.ezConfig = window.ezConfig || {}
window.ezConfig.userConfig = allUserConfig[APPNAME]

Vue.config.productionTip = false
Vue.config.errorHandler = function (err, vm, info) {
  // handle error
  // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
  // 只在 2.2.0+ 可用
  console && console.error(err)
}

Vue.use(VueI18n)
Vue.use(EzService, {
  apiUrl: window.ezConfig.userConfig.apiUrl,
  staticUrl: window.ezConfig.userConfig.assetsPublicPath + window.ezConfig.userConfig.assetsSubDirectory
})

Vue.mixin({
  methods: {
    logTheError (error) {
      if (console && console.error) {
        console.error(error)
      }
    },
    handleError (error) {
      if (!error.ok) {
        // window.location.reload()
        console.log(error)
      } else {
        if (console && console.error) {
          console.error(error)
        }
      }
    }
  }
})

var router = routerFactory(window.ezConfig.userConfig)

const i18n = new VueI18n({
  locale: 'zh-CN',
  silentTranslationWarn: true,
  missing: (locale, key, vm) => {
    return key
  },
  messages: i18nMessage
})

const PAGETITLEDOM = (document.head && document.head.getElementsByTagName('title')[0]) ? document.head.getElementsByTagName('title')[0] : null
const setHtmlPageTitle = function (newTitle) {
  if (PAGETITLEDOM) {
    let _newTitle = newTitle ? i18n.t(newTitle) + ' | ' + i18n.t('text.appName') : i18n.t('text.appName')
    PAGETITLEDOM.innerText = _newTitle
  }
}

router.afterEach(route => {
  let _title = route.meta.pageTitle ? route.meta.pageTitle : ''
  setHtmlPageTitle(_title)
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})
