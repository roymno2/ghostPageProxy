import Vue from 'vue'
import Router from 'vue-router'

import * as routerNames from './routerNames'

import Main from '../pages/main/Main'
import NotFound from '../pages/notFound/NotFound'
Vue.use(Router)

function getFixedUrl (url) {
  return url.slice(0, url.lastIndexOf('/'))
}

function getRouter (routes, rootUrl, historyMode) {
  if (historyMode) {
    for (var route of routes) {
      if (route.path.indexOf('/') === 0) {
        route.path = getFixedUrl(rootUrl) + route.path
      } else {
        route.path = rootUrl + route.path
      }
    }
  }
  return routes
}

var allRoutes = {
  ghostPage: [
    {
      path: '/',
      redirect: {
        name: routerNames.MAIN
      }
    },
    {
      path: '/main',
      name: routerNames.MAIN,
      component: Main,
      meta: {
        pageTitle: `router.${routerNames.MAIN}`,
        pageName: '代理记录'
      }
    },
    {
      path: '/404',
      name: routerNames.NOTFOUND,
      alias: '*',
      component: NotFound,
      meta: {
        pageTitle: `router.${routerNames.NOTFOUND}`
      }
    }
  ]
}

export default function (userConfig) {
  var historyMode = userConfig.historyMode === undefined ? true : userConfig.historyMode
  return new Router({
    mode: historyMode ? 'history' : 'hash',
    routes: getRouter(allRoutes[userConfig.appName], userConfig.routeUrl, historyMode)
  })
}
