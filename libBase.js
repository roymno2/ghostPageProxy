var http = require('http');
// 通用函数 =========
// 配置文件读取 END ==============================================

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

function findConfMatch (orgPath, confList) {
    let tmpCutPath = orgPath.split('?')[0]
    // 负责判定使用哪个代理配置
    // commonConf
    // 判断是否需要走代理
    for (let i = 0; i < confList.length; i++) {
        if (confList[i]['cutQuery'] === false) {
            if (confList[i]['rePath'] === false) {
                if (confList[i]['p'] === orgPath) {
                    return confList[i]
                }
            } else {
                if (confList[i]['p'].test(orgPath)) {
                    return confList[i]
                }
            }
        } else {
            if (confList[i]['rePath'] === false) {
                if (confList[i]['p'] === tmpCutPath) {
                    return confList[i]
                }
            } else {
                if (confList[i]['p'].test(tmpCutPath)) {
                    return confList[i]
                }
            }
        }
    }
    return null
}

function responseDelayReturn (finResponseDetail, proxyInfo, delay) {
    if (proxyInfo.statusCode !== 0) {
        // 如果proxyInfo.statusCode不等于0，则锁定statusCode
        finResponseDetail['statusCode'] = proxyInfo.statusCode
    }
    return new Promise((resolve, reject) => {
        if (delay > 0) {
            setTimeout(() => {
            resolve({ response: finResponseDetail });
            }, delay);
        } else {
            resolve({ response: finResponseDetail });
        }
    });
}

function runRewrite (orgPath, rewriteInfo) {
    // 为什么要用这么蛋疼的方式，把rewriteInfo做成数组再取第一个，就是因为我吃不准以后是一群rewrite还是一个rewrite，所以先做上兼容性处理
    if (rewriteInfo !== null) {
        return orgPath.replace(rewriteInfo.from, rewriteInfo.to)
    } else {
        return orgPath
    }
}

function runRebuildHeaders (newHeaders, host, port, cookie) {
    let realHostPort = host + ':' + port
    if (port === 80) {
        realHostPort = host
    }
    newHeaders['Host'] = realHostPort
    if (newHeaders['Referer'] !== undefined) {
        newHeaders['Referer'] = 'http://' + realHostPort + '/'
    }
    if (cookie !== undefined) {
        newHeaders['Cookie'] = cookie
    }
    return newHeaders
}

function responseContentReplace (finResponseDetail, proxyInfo, delay, requestMethod, requestPath, requestHeaders, outCallback) {
    return new Promise((resolve, reject) => {
        try {
            insideInfo = {
                hostname: proxyInfo['rep']['web']['host'],  
                port: parseInt(proxyInfo['rep']['web']['port']),
                path: runRewrite(requestPath, proxyInfo['rep']['rewrite']),  
                method: requestMethod,  
                headers: runRebuildHeaders(JSON.parse(JSON.stringify(requestHeaders)), proxyInfo['rep']['web']['host'], parseInt(proxyInfo['rep']['web']['port']), proxyInfo['rep']['cookie'])
            }
            console.log('    >>> front ' + insideInfo.method + " http://" + insideInfo.hostname + ':' + insideInfo.port + insideInfo.path)
            sendRequestOnce(insideInfo, null, (statusCode, statusMessage, headers, data) => {
                if (proxyInfo['rep']['force'] === true) {
                    finResponseDetail['statusCode'] = statusCode
                    finResponseDetail['header'] = headers
                    finResponseDetail['body'] = data
                    if (delay > 0) {
                        setTimeout(() => {
                        resolve({ response: finResponseDetail });
                        }, delay);
                    } else {
                        resolve({ response: finResponseDetail });
                    }
                } else {
                    if (finResponseDetail['statusCode'] === 404) {
                        finResponseDetail['statusCode'] = parseInt(statusCode)
                    }
                    if (proxyInfo.statusCode !== 0) {
                        // 如果proxyInfo.statusCode不等于0，则锁定statusCode
                        finResponseDetail['statusCode'] = proxyInfo.statusCode
                    }
                    finResponseDetail['body'] = data
                    finResponseDetail['header']['Content-Length'] = Buffer.byteLength(data)
                    if (headers['content-type'] !== undefined) {
                        finResponseDetail['header']['Content-Type'] = headers['content-type']
                    }
                    if (delay > 0) {
                        setTimeout(() => {
                        resolve({ response: finResponseDetail });
                        }, delay);
                    } else {
                        resolve({ response: finResponseDetail });
                    }
                }
            })
        } catch (e) {
            console.log(e)
            resolve({ response: finResponseDetail });
        }
    })
}

function responseContentFunc(finResponseDetail, proxyInfo, delay, requestDetail, responseDetail) {
    // 用于执行contentFunc功能
    return new Promise((resolve, reject) => {
        try {
            if (proxyInfo.statusCode !== 0) {
                // 如果proxyInfo.statusCode不等于0，则锁定statusCode
                finResponseDetail['statusCode'] = proxyInfo.statusCode
            }
            let tmpResult = proxyInfo['contentFunc'](finResponseDetail)
            if (Object.prototype.toString.call(tmpResult) === '[object String]') {
                finResponseDetail['body'] = tmpResult
                finResponseDetail['header']['Content-Length'] = finResponseDetail['body'].length
            } else {
                console.log('   !!!!')
                console.log('       contentFunc not return string', proxyInfo['p'])
                console.log('   !!!!')
                finResponseDetail['body'] = 'contentFunc not return string'
                finResponseDetail['header']['Content-Length'] = finResponseDetail['body'].length
            }
            if (delay > 0) {
                setTimeout(() => {
                resolve({ response: finResponseDetail });
                }, delay);
            } else {
                resolve({ response: finResponseDetail });
            }
        } catch (e) {
            console.log(e)
            resolve({ response: finResponseDetail });
        }
    })
}

module.exports = {
    findConfMatch,
    sendRequestOnce,
    runRewrite,
    responseDelayReturn,
    responseContentReplace,
    responseContentFunc
}