'use strict';
const http = require('http');
const fs = require('fs')
var express = require("express");
var confController = require('./libConf')
var libBase = require('./libBase')
var webInsideController = require('./dev-server')

class appHubController {
    //构造函数
    constructor() {
        this.hubId = 0
        this.recordHistoryLimit = 1000;
        // 请求缓存池，最近500条
        this.recordHistoryList = [];
        this.proxySettingController = new confController()
        this.proxyConf = this.proxySettingController.loadConf()
    }
    loadConf () {
      return this.proxySettingController.loadConfOrg()
    }
    saveConf (content) {
      this.proxySettingController.saveConfOrg(content)
      this.proxyConf = this.proxySettingController.loadConf()
    }
    getHistory () {
      return this.recordHistoryList
    }
    // 负责检查请求是否有匹配
    matchProxy (requestDetail) {
        // 检查是否有匹配的主机代理配置
        if (this.proxyConf.hasOwnProperty(requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port) === true) {
            let hostProxyConfCell = this.proxyConf[requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port]
            // 检查路径匹配情况
            let orgMethod = requestDetail.requestOptions.method
            let orgPath = requestDetail.requestOptions.path
            for (let i = 0; i < hostProxyConfCell["proxyList"].length; i++) {
                // 如果对method没有要求或者 method与请求一致
                if (hostProxyConfCell["proxyList"][i]['orgMethod'] === null || orgMethod === hostProxyConfCell["proxyList"][i]['orgMethod']) {
                    if (hostProxyConfCell["proxyList"][i]['orgUseRe'] === true) {
                        // 如果使用正则匹配模式
                        if (hostProxyConfCell["proxyList"][i]['orgPath'].test(orgPath)) {
                            return this.matchProxyOutConf(hostProxyConfCell, i, orgPath, orgMethod, requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port)
                        }
                    } else if (orgPath.startsWith(hostProxyConfCell["proxyList"][i]['orgPath'])) {
                        // 如果是非正则匹配模式，且命中的话
                        return this.matchProxyOutConf(hostProxyConfCell, i, orgPath, orgMethod, requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port)
                    }
                }
            }
        }
        // 记录未匹配到的
        this.recordListAdd(requestDetail, "", "", "", "")
        return null
    }

    matchProxyOutConf(hostProxyConfCell, idIndex, orgPath, orgMethod, orgHost) {
        // 用于生成之后要用的信息
        let webPath = orgPath
        if (hostProxyConfCell["proxyList"][idIndex]["webRewrite"] !== null) {
            webPath = orgPath.replace(hostProxyConfCell["proxyList"][idIndex]["webRewrite"]['from'], hostProxyConfCell["proxyList"][idIndex]["webRewrite"]['to'])
        }
        return {
            "webHost": hostProxyConfCell["webHost"],
            "webPort": hostProxyConfCell["webPort"],
            "webPath": webPath,
            "webHeader": hostProxyConfCell["proxyList"][idIndex]["webHeader"],
            "webRewrite": hostProxyConfCell["proxyList"][idIndex]["webRewrite"],
            "resDelay": hostProxyConfCell["proxyList"][idIndex]["resDelay"],
            "resContent": hostProxyConfCell["proxyList"][idIndex]["resContent"],
            "resStatus": hostProxyConfCell["proxyList"][idIndex]["resStatus"],
            "orgHost": orgHost,
            "orgPath": orgPath,
            "debug": hostProxyConfCell["debug"],
            "useFake": hostProxyConfCell["proxyList"][idIndex]["useFake"],
            "orgMethod": orgMethod
        }
    }

    runProxyForward (proxyInfo, requestDetail, responseDetail) {
        if (proxyInfo["orgPath"] === proxyInfo["newPath"]) {
            console.log("  send >> " + proxyInfo["orgMethod"] + " " + proxyInfo["orgHost"] + proxyInfo["orgPath"] + " ->> " + proxyInfo["webHost"] + ':' + proxyInfo["webPort"])
        } else {
            console.log("  send >> " + proxyInfo["orgMethod"] + " " + proxyInfo["orgHost"] + proxyInfo["orgPath"] + " ->> " + proxyInfo["webHost"] + ':' + proxyInfo["webPort"] + proxyInfo["webPath"])
        }
        // 记录匹配到的
        let tmpReqInfo = this.recordListAdd(requestDetail, proxyInfo["webHost"], proxyInfo["webPort"], proxyInfo["webPath"], proxyInfo["webHeader"], proxyInfo["debug"])
        if (proxyInfo['debug'] === true) {
          return libBase.responseContentReplace(proxyInfo, requestDetail, responseDetail, tmpReqInfo)
        } else {
          return libBase.responseContentReplace(proxyInfo, requestDetail, responseDetail, null)
        }
        // return null
    }

    checkHostInConfig (requestDetail) {
      if (this.proxyConf.hasOwnProperty(requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port) === true) {
        return true
      } else {
        if (requestDetail.requestOptions.hostname === 'localhost' || requestDetail.requestOptions.hostname === '127.0.0.1') {
          if (this.proxyConf.hasOwnProperty('127.0.0.1:' + requestDetail.requestOptions.port) === true || this.proxyConf.hasOwnProperty('localhost:' + requestDetail.requestOptions.port) === true) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      }
    }

    recordListAdd (requestDetail, webHost, webPort, webPath, webHeader, isDebug) {
      if (this.checkHostInConfig(requestDetail) === true) {
        let nowTime = new Date()
        this.hubId = this.hubId + 1
        let tmpReqInfo = {
          id: String(this.hubId),
          debug: isDebug,
          time: this.recordGetTime(nowTime),
          orgHost: requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port,
          orgMethod: requestDetail.requestOptions.method,
          orgPathWithMethod: requestDetail.requestOptions.method + ' ' + requestDetail.requestOptions.path,
          orgPath: requestDetail.requestOptions.path,
          orgResponseStatusCode: '',
          webHost: webHost,
          webPath: webPath,
          orgType: '',
          orgRequestHeader: '',
          orgResponseHeader: '',
          webRequestHeader: '',
          webHeader: this.recordHeaderPackage(webHeader),
          webResponseStatusCode: '',
          webResponseHeader: '',
          webResponseContent: '',
          webResponseError: '',
          orgResponseContent: '',
          finResponseStatusCode: '',
          finResponseHeader: '',
          orgPayload: '',
        };
        if (webHost !== "") {
          if (webPath === tmpReqInfo["orgPath"]) {
            tmpReqInfo["webHostLite"] = tmpReqInfo["webHost"] + ":" + webPort + "/[同原路径]"
          } else {
            tmpReqInfo["webHostLite"] = tmpReqInfo["webHost"] + ":" + webPort + "/[展开看详细路径]"
          }
          tmpReqInfo["webHost"] = tmpReqInfo["webHost"] + ":" + webPort + tmpReqInfo["webPath"]
        } else {
          tmpReqInfo["webHostLite"] = '[未转发]'
          tmpReqInfo["webHost"] = '[未转发]'
        }
        let path_split_end = tmpReqInfo['orgPath'].split(".");
        if (path_split_end.length > 1) {
          let end_str = path_split_end[path_split_end.length - 1]
          if (end_str === "html" || end_str === "htm") {
            tmpReqInfo["orgType"] = '页面'
          } else if (end_str === 'js') {
            tmpReqInfo["orgType"] = '脚本'
          } else if (end_str === 'css') {
            tmpReqInfo["orgType"] = '样式'
          } else if (end_str === 'svg') {
            tmpReqInfo["orgType"] = 'SVG'
          } else if (end_str === 'png' || end_str === 'gif' || end_str === 'jpeg' || end_str === 'jpg') {
            tmpReqInfo["orgType"] = '图片'
          } else if (end_str === 'ico') {
            tmpReqInfo["orgType"] = '图标'
          }
        }

        // 加入缓存
        this.recordHistoryList.unshift(tmpReqInfo);
        this.recordListClean()
        return tmpReqInfo
      }
      return null
    }


    recordGetTime (tmpDate) {
      return tmpDate.getFullYear() + '-' + (tmpDate.getMonth() + 1) + '-' + tmpDate.getDate() + ' ' + tmpDate.getHours() + ":" + tmpDate.getMinutes() + ":" + tmpDate.getSeconds()
    }

    recordHeaderPackage (headerObject) {
      if (headerObject !== null && headerObject !== undefined) {
        let outStr = ''
        for (let i in headerObject) {
          outStr = outStr + i + ": " + headerObject[i]
        }
        return outStr
      } else {
        return ""
      }
    }

    recordListClean () {
        let outLen = this.recordHistoryList.length - this.recordHistoryLimit;
        if (outLen > 0) {
            let deleteCount = 0
            this.recordHistoryList.splice(this.recordHistoryLimit - 1, outLen)
        }
    }

    recordListReset () {
      this.recordHistoryList = []
    }
}
var appHubInside = new appHubController();
var webInside = new webInsideController(appHubInside);
module.exports = appHubInside
