var http = require('http');
var cssReg = new RegExp(".*\.css")
// 通用函数 =========
// 配置文件读取 END ==============================================

function responseContentReplace (proxyInfo, requestDetail, responseDetail, tmpReqInfo) {
    // 按照proxyInfo去发送请求
    const finResponseDetail = responseDetail.response
    if (tmpReqInfo !== null) {
      tmpReqInfo['orgResponseHeader'] = JSON.stringify(finResponseDetail['header'], null, 4)
      tmpReqInfo['orgRequestHeader'] = JSON.stringify(requestDetail.requestOptions.headers, null, 4)
      if (tmpReqInfo['orgMethod'] !== 'GET' || tmpReqInfo['orgMethod'] !== 'get') {
        if (requestDetail.requestData.length <= 10000) {
          try {
            tmpReqInfo['orgPayload'] = String(requestDetail.requestData)
          } catch (e) {
            tmpReqInfo['webResponseError'] = tmpReqInfo['webResponseError'] + 'org payload data get fail: ' + String(e)
            tmpReqInfo['orgPayload'] = String(requestDetail.requestData)
          }
        } else {
          tmpReqInfo['orgPayload'] = '[数据过长，不进行显示]'
        }
      }
    }
    const startTimestamp = new Date().getTime()
    // 返回一个promise
    return new Promise((resolve, reject) => {
        // 如果没有设置返回内容
        if (proxyInfo["resContent"] === null) {
            // try {
            let webOutHeader = null
            if (parseInt(proxyInfo["webPort"]) === 80) {
                webOutHeader = runRebuildHeaders(JSON.parse(JSON.stringify(requestDetail.requestOptions.headers)), proxyInfo["webHost"], proxyInfo["webHeader"])
            } else {
                webOutHeader = runRebuildHeaders(JSON.parse(JSON.stringify(requestDetail.requestOptions.headers)), proxyInfo["webHost"] + ':' + String(proxyInfo["webPort"]), proxyInfo["webHeader"])
            }
            // 生成发送请求用的对象
            let insideInfo = {
                hostname: proxyInfo["webHost"],
                port: parseInt(proxyInfo["webPort"]),
                path: proxyInfo["webPath"],
                method: proxyInfo["orgMethod"],
                headers: webOutHeader
            }
            tmpReqInfo['webRequestHeader'] = JSON.stringify(insideInfo.headers, null, 4)
            let tmpPayload = undefined
            if (insideInfo.method === 'POST') {
                // if (tmpReqInfo !== null) {
                //   if (String(requestDetail.requestData)) {
                //     tmpReqInfo['payload'] = JSON.stringify(requestDetail.requestOptions.headers, null, 4)
                //   }
                // }
                tmpPayload = requestDetail.requestData
            }
            // 发送请求
            sendRequestOnce(insideInfo, tmpPayload, (statusCode, statusMessage, headers, data, error) => {
                if (error === undefined) {
                if (tmpReqInfo !== null) {
                    tmpReqInfo['webResponseStatusCode'] = String(statusCode)
                    tmpReqInfo['webResponseHeader'] = JSON.stringify(headers, null, 4)
                    try {
                    tmpReqInfo['webResponseContent'] = data.toString()
                    } catch (e) {
                    tmpReqInfo['webResponseError'] = tmpReqInfo['webResponseError'] + 'web response data get fail: ' + String(e)
                    }
                    tmpReqInfo['orgResponseStatusCode'] = String(finResponseDetail['statusCode'])
                    if (tmpReqInfo['webResponseError'] === '') {
                    tmpReqInfo['webResponseError'] = '无错误'
                    }
                    try {
                    tmpReqInfo['orgResponseContent'] = finResponseDetail['body'].toString()
                    } catch (e) {
                    tmpReqInfo['webResponseError'] = tmpReqInfo['webResponseError'] + 'org response data get fail: ' + String(e)
                    }
                }
                console.log("web statusCode", statusCode)
                if (finResponseDetail['statusCode'] === 404) {
                    finResponseDetail['header'] = headers
                }
                if (cssReg.test(proxyInfo["orgPath"])) {
                    finResponseDetail['header']['Content-Type'] = 'text/css'
                }
                // console.log("web headers", headers)
                console.log("web data", data.toString().length)
                if (proxyInfo["resStatus"] !== null) {
                    // 如果有设置http返回码

                    finResponseDetail['statusCode'] = proxyInfo["resStatus"]
                } else {
                    finResponseDetail['statusCode'] = parseInt(statusCode)
                }
                if (tmpReqInfo !== null) {
                    tmpReqInfo['finResponseStatusCode'] = String(finResponseDetail['statusCode'])
                    tmpReqInfo['finResponseHeader'] = JSON.stringify(finResponseDetail['header'], null, 4)
                }
                // 使用返回的headers
                // finResponseDetail['header'] = headers
                // 使用返回的数据
                finResponseDetail['body'] = data
                // 如果有setTimeout，则按照setTimeout处理
                let timeDiff = new Date().getTime() - startTimestamp
                if (proxyInfo["resDelay"] > 0 && timeDiff < proxyInfo["resDelay"]) {
                    setTimeout(() => {
                    resolve({ response: finResponseDetail });
                    }, proxyInfo["resDelay"] - timeDiff);
                } else {
                    resolve({ response: finResponseDetail });
                }
                } else {
                if (tmpReqInfo !== null) {
                    tmpReqInfo['webResponseError'] = tmpReqInfo['webResponseError'] + 'web response time out: ' + String(error)
                }
                resolve({ response: finResponseDetail });
                }
            })
            // } catch (e) {
            //     if (tmpReqInfo !== null) {
            //       tmpReqInfo['webResponseError'] = tmpReqInfo['webResponseError'] + 'web response catch error: ' + String(e)
            //     }
            //     resolve({ response: finResponseDetail });
            // }
        } else {
            // 如果有设置返回内容
            if (proxyInfo["resStatus"] !== null) {
                // 如果有设置http返回码
                finResponseDetail['statusCode'] = proxyInfo["resStatus"]
            }
            finResponseDetail['body'] = proxyInfo["resContent"]
            let timeDiff = new Date().getTime() - startTimestamp
            if (proxyInfo["resDelay"] > 0 && timeDiff < proxyInfo["resDelay"]) {
                setTimeout(() => {
                    resolve({ response: finResponseDetail });
                }, proxyInfo["resDelay"] - timeDiff);
            } else {
                resolve({ response: finResponseDetail });
            }
        }
    })
}

function runRebuildHeaders (webHeader, webHost, header) {
    if (webHeader.hasOwnProperty('host')) {
        webHeader['host'] = webHost
    }
    if (webHeader.hasOwnProperty('Host')) {
        webHeader['Host'] = webHost
    }
    if (webHeader.hasOwnProperty('Referer')) {
        webHeader['Referer'] = 'http://' + webHost + '/'
    }
    if (webHeader.hasOwnProperty('referer')) {
        webHeader['referer'] = 'http://' + webHost + '/'
    }
    if (header !== null) {
        for (let i in header){
            webHeader[i] = header[i]
        }
    }
    return webHeader
}

function sendRequestOnce(options, postData, outCallback) {
    // 发送一个请求
    let lenData = 0
    if (postData !== undefined && postData !== null) {
        lenData = Buffer.byteLength(postData)
    }
    if (options.method === 'GET') {
        if (options.headers['content-length'] !== undefined) {
            options.headers['content-length'] = undefined
            delete options.headers['content-length']
        }
    } else if (lenData > 0) {
        options.headers['content-length'] = lenData
    }
    // headerConsole(options['headers'], 'add req')

    var req = http.request(options, function(res) {
        // 返回的端口号
        // 返回的头
        var chunks = [];
        var size = 0;
        // 因为是以buffer形式处理，所以不要setEncoding
        // res.setEncoding('utf-8');
        res.on('data',function(chun){
            chunks.push(chun);
            size += chun.length
        });
        res.on('end',function(){
            switch(chunks.length) {
                case 0: data = new Buffer(0);
                    break;
                case 1: data = chunks[0];
                    break;
                default:
                    data = new Buffer(size);
                    for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
                        let chunk = chunks[i];
                        chunk.copy(data, pos);
                        pos += chunk.length;
                    }
                    break;
            }
            outCallback(res.statusCode, res.statusMessage, res.headers, data)
        });
    });
    req.on('error',function(err){
        console.error(err);
      outCallback(500, 'time out', {}, null, 'time out')
    });
    if (options.method !== 'GET' && options.method !== 'DELETE') {
        // 如果是get，则跳过write这步
        req.write(postData);
    }
    req.end();
}


module.exports = {
    responseContentReplace
}
