// var libBase = require('./libBase')

// 配置文件读取 ==============================================
function rebuildRewriteCell (itemCell, defaultRewrite) {
    // rewrite 是个对象
    // 重构含有rewrite这个key的object行
    // 可以整个用default，也可以局部引入default
    if (itemCell['rewrite'] !== null && itemCell['rewrite'] !== undefined ) {
        if (itemCell['rewrite']['default'] === true && defaultRewrite !== undefined && defaultRewrite !== null) {
            // 如果未定义rewrite
            itemCell['rewrite'] = defaultRewrite
        }
        let tmpConfWrite = itemCell['rewrite']
        if (tmpConfWrite['useRe'] === false) {
            itemCell['rewrite'] = {'from': tmpConfWrite['from'], 'to': tmpConfWrite['to']}
        } else {
            itemCell['rewrite'] = {'from': new RegExp(tmpConfWrite['from']), 'to': tmpConfWrite['to']}
        }
    }
    if (itemCell['rewrite'] === undefined) {
        itemCell['rewrite'] = null
    }
    return itemCell
}

function readProxySetting () {
    // 读取代理配置
    let finOut = {}
    try {
        var fs = require('fs')
        let proxyDataJs = fs.readFileSync('./proxysetting.js', 'utf-8')
        eval(proxyDataJs)
        let proxyData = controllerInfo
        let passHost = {}
        proxyData['svrDict'] = {}
        for (let km in proxyData['webSvr']) {
            proxyData['svrDict'][km] = proxyData['webSvr'][km]
        }
        for (let km in proxyData['remoteSvr']) {
            proxyData['svrDict'][km] = proxyData['remoteSvr'][km]
        }
        if (proxyData.hasOwnProperty('proxyList')) {
            let orgList = proxyData['proxyList']
            for (let i = 0; i < orgList.length; i++) {
                if (orgList[i]['rePath'] === undefined) {
                    orgList[i]['rePath'] = true
                }
                if (orgList[i]['statusCode'] === null || orgList[i]['statusCode'] === undefined || orgList[i]['statusCode'] === '') {
                    orgList[i]['statusCode'] = 0  
                } else {
                    orgList[i]['statusCode'] = parseInt(orgList[i]['statusCode'])
                }
                // 替换delay
                if (orgList[i]['delay'] === 0 || orgList[i]['delay'] === undefined || orgList[i]['delay'] === null) {
                    orgList[i]['delay'] = 0
                }
                // 替换svr
                for (let m = 0; m < orgList[i].svr.length; m++) {
                    if (orgList[i]['svr'][m] === 'default') {
                        orgList[i]['svr'][m] = proxyData['defaultRemote']
                    }
                    if (proxyData['svrDict'][orgList[i]['svr'][m]] !== undefined) {
                        orgList[i]['svr'][m] = proxyData['svrDict'][orgList[i]['svr'][m]]
                    } else {
                        var e = new Error();
                        e.message = "svrDict not exist";
                        throw e;
                    }
                }
                // 替换rewrite
                if (orgList[i]['rep'] === undefined) {
                    orgList[i]['rep'] = null
                }
                if (orgList[i]['rep'] !== null) {
                    rebuildRewriteCell(orgList[i]['rep'], proxyData['defaultRewrite'])
                    // 替换web
                    if (orgList[i]['rep']['web'] === 'default') {
                        orgList[i]['rep']['web'] = proxyData['defaultLocal']
                    }
                    if (proxyData['svrDict'][orgList[i]['rep']['web']] !== undefined) {
                        orgList[i]['rep']['web'] = proxyData['svrDict'][orgList[i]['rep']['web']]
                    } else {
                        var e = new Error();
                        e.message = "svrDict not exist";
                        throw e;
                    }
                }
            }
            let tmpMidList = []
            for (let i = 0; i < orgList.length; i++) {
                for (let m = 0; m < orgList[i]['p'].length; m++) {
                    // 替换p
                    let newCell = Object.assign({}, orgList[i])
                    // 很暴力的替换了
                    orgList[i]['p'][m] = orgList[i]['p'][m].replace(/\{param\}/, '[^/]+')
                    if (orgList[i]['addEnd'] === true) {
                        orgList[i]['p'][m] = orgList[i]['p'][m] + '$'
                    }
                    if (orgList[i]['prefix'] !== undefined && orgList[i]['prefix'] !== '' && orgList[i]['prefix'] !== null) {
                        orgList[i]['p'][m] = orgList[i]['prefix'] + orgList[i]['p'][m]
                    }
                    if (orgList[i]['rePath'] === true) {
                        newCell['p'] = new RegExp(orgList[i]['p'][m])
                    } else {
                        newCell['p'] = orgList[i]['p'][m]
                    }
                    tmpMidList.push(newCell)
                }
            }
            orgList = tmpMidList
            // 完成填装，开始切换数据形态，生成passHost对象
            for (let i = 0; i < orgList.length; i++) {
                for (let m = 0; m < orgList[i]['svr'].length; m++) {
                    let svrId = orgList[i]['svr'][m].host + ':' + String(orgList[i]['svr'][m].port)
                    if (passHost[svrId] === undefined) {
                        passHost[svrId] = []
                    }
                    passHost[svrId].push(orgList[i])
                }
            }
            let passPre = {}
            if (proxyData['changeList'] === undefined) {
                proxyData['changeList'] = []
            }
            for (let i = 0; i < proxyData['changeList'].length; i++) {
                if (proxyData['changeList'][i]['rePath'] === undefined) {
                    proxyData['changeList'][i]['rePath'] = true
                }
                for (let m = 0; m < proxyData['changeList'][i]['svr'].length; m++) {
                    if (proxyData['changeList'][i]['svr'][m] === 'default') {
                        proxyData['changeList'][i]['svr'][m] = proxyData['defaultRemote']
                    }
                    if (proxyData['svrDict'][proxyData['changeList'][i]['svr'][m]] !== undefined) {
                        proxyData['changeList'][i]['svr'][m] = proxyData['svrDict'][proxyData['changeList'][i]['svr'][m]]
                    } else {
                        var e = new Error();
                        e.message = "svrDict not exist";
                        throw e;
                    }
                }
                rebuildRewriteCell(proxyData['changeList'][i], proxyData['defaultRewrite'])
            }
            tmpMidList = []
            orgList = proxyData['changeList']
            for (let i = 0; i < orgList.length; i++) {
                for (let m = 0; m < orgList[i]['p'].length; m++) {
                    // 替换p
                    let newCell = Object.assign({}, orgList[i])
                    // 很暴力的替换了
                    orgList[i]['p'][m] = orgList[i]['p'][m].replace(/\{param\}/, '[^/]+')
                    if (orgList[i]['addEnd'] === true) {
                        orgList[i]['p'][m] = orgList[i]['p'][m] + '$'
                    }
                    if (orgList[i]['prefix'] !== undefined && orgList[i]['prefix'] !== '' && orgList[i]['prefix'] !== null) {
                        orgList[i]['p'][m] = orgList[i]['prefix'] + orgList[i]['p'][m]
                    }
                    if (orgList[i]['rePath'] === true) {
                        newCell['p'] = new RegExp(orgList[i]['p'][m])
                    } else {
                        newCell['p'] = orgList[i]['p'][m]
                    }
                    tmpMidList.push(newCell)
                }
            }
            proxyData['changeList'] = tmpMidList
            for (let i = 0; i < proxyData['changeList'].length; i++) {
                for (let m = 0; m < proxyData['changeList'][i]['svr'].length; m++) {
                    let svrId = proxyData['changeList'][i]['svr'][m].host + ':' + String(proxyData['changeList'][i]['svr'][m].port)
                    if (passPre[svrId] === undefined) {
                        passPre[svrId] = []
                    }
                    passPre[svrId].push(proxyData['changeList'][i])
                }
            }
            console.log(passPre)
            return {passHost: passHost, passPre: passPre}
        } else {
            var e = new Error();
            e.message = "proxysetting.json content error";
            throw e;
        }
    // return backupUrl
    } catch (e) {
        console.log('>>> proxy Setting load fail <<<', e)
        process.exit()
    }
}

var realProxyData = readProxySetting()

module.exports = realProxyData