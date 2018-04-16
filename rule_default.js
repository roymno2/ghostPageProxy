'use strict';
// 用于anyproxy4.0.6版
var http = require('http');
var fs = require('fs')
var comConf = require('./libConf')
var libBase = require('./libBase')

// var libLogin = require('./libLogin')
// var libReq = require('./libReq')

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
    if (comConf['passPre'][requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port] !== undefined) {
      // 此时认定 path: requestDetail.requestOptions.path; host: requestDetail.requestOptions.hostname; port: requestDetail.requestOptions.port
      let proxyInfo = libBase.findConfMatch(requestDetail.requestOptions.path, comConf['passPre'][requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port])
      if (proxyInfo !== null) {
        const newRequestOptions = requestDetail.requestOptions;
        let lastPath = newRequestOptions.path
        newRequestOptions.path = libBase.runRewrite(newRequestOptions.path, proxyInfo['rewrite'])
        console.log('>>> change path: ' + lastPath + ' -> ' + newRequestOptions.path)
        return requestDetail
      }
    }
    return null;
  },


  /**
   *
   *
   * @param {object} requestDetail
   * @param {object} responseDetail
   */
  *beforeSendResponse(requestDetail, responseDetail) {
    if (comConf['passHost'][requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port] !== undefined) {
      // 此时认定 path: requestDetail.requestOptions.path; host: requestDetail.requestOptions.hostname; port: requestDetail.requestOptions.port
      let proxyInfo = libBase.findConfMatch(requestDetail.requestOptions.path, comConf['passHost'][requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port])
      if (proxyInfo !== null) {
        const finResponseDetail = responseDetail.response;
        if (proxyInfo['contentFunc'] !== null && proxyInfo['contentFunc'] !== undefined) {
          return libBase.responseContentFunc(finResponseDetail, proxyInfo, proxyInfo['delay'], requestDetail, responseDetail)
        } else if (proxyInfo['rep'] !== null && proxyInfo['rep'] !== undefined) {
          return libBase.responseContentReplace(finResponseDetail, proxyInfo, proxyInfo['delay'], requestDetail.requestOptions.method, requestDetail.requestOptions.path, requestDetail.requestOptions.headers)
        } else {
          return libBase.responseDelayReturn(finResponseDetail, proxyInfo, proxyInfo['delay'])
        }
      }
    }
    return null
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
