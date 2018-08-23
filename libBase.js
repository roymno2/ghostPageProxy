var http = require('http');
var cssReg = new RegExp(".*\.css")
// 通用函数 =========
// 配置文件读取 END ==============================================

function responseContentReplace (proxyInfo, requestDetail, responseDetail) {
    // 按照proxyInfo去发送请求
    const finResponseDetail = responseDetail.response
    const startTimestamp = new Date().getTime()
    // 返回一个promise
    return new Promise((resolve, reject) => {
        // 如果没有设置返回内容
        if (proxyInfo["resContent"] === null) {
            try {
                // 生成发送请求用的对象
                let insideInfo = {
                    hostname: proxyInfo["webHost"],
                    port: parseInt(proxyInfo["webPort"]),
                    path: proxyInfo["newPath"],
                    method: proxyInfo["reqMethod"],
                    headers: runRebuildHeaders(JSON.parse(JSON.stringify(requestDetail.requestOptions.headers)), proxyInfo["webHost"], proxyInfo["reqHeader"])
                }
                // 发送请求
                sendRequestOnce(insideInfo, null, (statusCode, statusMessage, headers, data) => {
                    console.log("web statusCode", statusCode)
                    if (finResponseDetail['statusCode'] === 404) {
                        finResponseDetail['header'] = headers
                    }
                    if (cssReg.test(proxyInfo["reqPath"])) {
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
                })
            } catch (e) {
                console.log(e)
                resolve({ response: finResponseDetail });
            }
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

function runRebuildHeaders (newHeaders, webHost, header) {
    if (newHeaders.hasOwnProperty('host')) {
        newHeaders['host'] = webHost
    }
    if (newHeaders.hasOwnProperty('Host')) {
        newHeaders['Host'] = webHost
    }
    if (newHeaders.hasOwnProperty('Referer')) {
        newHeaders['Referer'] = 'http://' + webHost + '/'
    }
    if (newHeaders.hasOwnProperty('referer')) {
        newHeaders['referer'] = 'http://' + webHost + '/'
    }
    if (header !== null) {
        for (let i in header){
            newHeaders[i] = header[i]
        }
    }
    return newHeaders
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
    });
    if (options.method !== 'GET') {
        // 如果是get，则跳过write这步
        req.write(postData);
    }
    req.end();
}


module.exports = {
    responseContentReplace
}