'use strict';
// 用于anyproxy4.0.6版
const http = require('http');
const fs = require('fs')
let {appHubController} = require("./libDevServer")
const appHub = new appHubController()
appHub.setRouter()
module.exports = {

  summary: 'the default rule for AnyProxy',

  /**
   *
   *
   * @param {object} requestDetail
   * @param {string} requestDetail.protocol
   * @param {object} requestDetail.requestOptions
   * @param {object} requestDetail.requestData
   * @param {object} requestDetail.response
   * @param {number} requestDetail.response.statusCode
   * @param {object} requestDetail.response.header
   * @param {buffer} requestDetail.response.body
   * @returns
   */
  *beforeSendRequest(requestDetail) {
    // 负责记录请求，在此处记录的原因是返回请求可能很慢
    appHub.recordCountAdd()
    appHub.recordListAdd(requestDetail)
    return null;
  },


  /**
   *
   *
   * @param {object} requestDetail
   * @param {object} responseDetail
   */
  *beforeSendResponse(requestDetail, responseDetail) {
    // 检查是否匹配代理
    let proxyInfo = appHub.matchProxy(requestDetail);
    if (proxyInfo !== null) {
      // 如果匹配则执行二重发送动作
      return appHub.runProxyForward(proxyInfo, requestDetail, responseDetail)
    } else {
      return null
    }
  },

  /**
   * default to return null
   * the user MUST return a boolean when they do implement the interface in rule
   *
   * @param {any} requestDetail
   * @returns
   */
  *beforeDealHttpsRequest(requestDetail) {
    return null;
  },

  /**
   *
   *
   * @param {any} requestDetail
   * @param {any} error
   * @returns
   */
  *onError(requestDetail, error) {
    return null;
  },


  /**
   *
   *
   * @param {any} requestDetail
   * @param {any} error
   * @returns
   */
  *onConnectError(requestDetail, error) {
    return null;
  },
};
