import Vue from 'vue'
import VueResource from 'vue-resource'
import localStore from 'store2'

import redirect from '../router/redirect'

Vue.use(VueResource)

// 0为 timeout 的初始默认值，运行时的实际值是 use 该插件时传入的，这一过程一般在 main.js 中完成。
var timeout = 0
// staticUrl 与 apiUrl 都需要在插件的 config 中进行配置
var staticUrl = '/static'
var apiUrl = '/api'

var before = function (context, requestKey) {
  var _fun = function (request) {}
  if (requestKey) {
    context._requestKeyMap = context._requestKeyMap || {}
    _fun = function (request) {
      if (context._requestKeyMap[requestKey]) {
        context._requestKeyMap[requestKey].abort()
      }
      context._requestKeyMap[requestKey] = request
    }
  }
  return _fun
}

function getUrl (url, staticResource) {
  return (staticResource ? staticUrl : apiUrl) + url
}

function dataPromise (context, method, url, param, emulateJSON, staticResource, selfTimeout, requestKey) {
  if (emulateJSON === undefined) {
    emulateJSON = false
  }
  if (selfTimeout === undefined) {
    selfTimeout = timeout
  } else {
    selfTimeout = (selfTimeout < 0 || typeof selfTimeout !== 'number') ? 0 : selfTimeout
  }

  let result = null
  if ('post&put&patch'.indexOf(method) !== -1) {
    result = context.$http[method](getUrl(url, staticResource), param, { emulateJSON: emulateJSON, before: before(context, requestKey) })
  } else {
    result = context.$http[method](getUrl(url, staticResource), { params: param, emulateJSON: emulateJSON, before: before(context, requestKey) })
  }

  result = result.then(({ data }) => {
    if (requestKey) {
      context._requestKeyMap[requestKey] = undefined
      // delete context._requestKeyMap[requestKey]
    }
    if (data.state !== undefined && data.state !== 0) {
      redirect(context, data.state, data.data)
    }
    return data
  })

  if (selfTimeout) {
    return Promise.race([
      result,
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('request timeout'))
        }, selfTimeout)
      })
    ])
  } else {
    return result
  }
}

function getMethod (method) {
  let staticResource = false
  if (method === 'static') {
    staticResource = true
    method = 'get'
  }

  return function (context, url, param, emulateJSON, timeout, requestKey) {
    return dataPromise(context, method, url, param, emulateJSON, staticResource, timeout, requestKey)
  }
}

var getKeyName = function (obj) {
  return Object.values(obj).join('&')
}

var saveToLocal = function (key, subKey, data, lastModified) {
  if (!localStore.isFake()) {
    if (subKey) {
      if (!localStore.local.has(key)) {
        localStore.local(key, {})
      }
      localStore.local.transact(key, function (obj) {
        obj[subKey] = {
          data: data,
          lastModified: lastModified || ''
        }
      })
    } else {
      localStore.local(key, {
        data: data,
        lastModified: lastModified || ''
      })
    }
  }
}
var getFromLocal = function (key, subKey) {
  let _data = null
  if (!localStore.isFake() && localStore.local(key)) {
    _data = subKey ? localStore.local(key)[subKey] : localStore.local(key)
  }
  return _data
}

function dataServicesWithCache (context, method, url, param, emulateJSON, reset, lastModified, staticResource, timeout) {
  let subKey = getKeyName(param)
  let _data = getFromLocal(url, subKey)
  if (!_data || reset || _data.lastModified !== lastModified) {
    return dataPromise(context, method, url, param, emulateJSON, staticResource, timeout).then((data) => {
      saveToLocal(url, subKey, data, lastModified)
      return data
    })
  } else {
    return Promise.resolve(_data.data)
  }
}

function getCacheMethod (method) {
  let staticResource = false
  if (method === 'static') {
    staticResource = true
    method = 'get'
  }
  return function (context, url, param, emulateJSON, lastModified, timeout) {
    return dataServicesWithCache(context, method, url, param, emulateJSON, false, lastModified, staticResource, timeout)
  }
}

export default {
  install: function (Vue, opt) {
    if (opt && typeof opt.timeout === 'number') {
      timeout = opt.timeout < 0 ? 0 : opt.timeout
    }
    staticUrl = (opt && opt.staticUrl) ? opt.staticUrl : staticUrl
    apiUrl = (opt && opt.apiUrl) ? opt.apiUrl : apiUrl

    Vue.prototype.$service = {
      get: getMethod('get'),
      head: getMethod('head'),
      delete: getMethod('delete'),
      jsonp: getMethod('jsonp'),
      post: getMethod('post'),
      put: getMethod('put'),
      patch: getMethod('patch'),
      static: getMethod('static'),
      staticUrl: staticUrl,
      cache: {
        static: getCacheMethod('static'),
        get: getCacheMethod('get'),
        post: getCacheMethod('post'),
        jsonp: getCacheMethod('jsonp')
      }
    }
  }
}
