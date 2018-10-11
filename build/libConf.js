
var fs = require('fs')
var gettype = Object.prototype.toString
// 设计目标是读取和保存配置文件，并使配置封装在自己这边
class confController {
    //构造函数
    constructor() {
      this.confFilePath = './build/proxysetting.json'
    }

    rebuildCellDelay (delayCell) {
        if (delayCell === 0 || delayCell === undefined || delayCell === null) {
            return 0
        } else {
            return delayCell * 1000
        }
    }

    rebuildCellRewrite (tmpConfWrite) {
        // repObject {"from": "", "to": "", "useRegex": true}
        if (tmpConfWrite === undefined || tmpConfWrite === null) {
            // 如果没写/undefined/null的话，
            return null
        } else {
            if (tmpConfWrite['from'] === '' && tmpConfWrite['to'] === '') {
                return null
            } else {
                // 如果useRe是false的话,则不做正则处理，不写默认为true
                if (tmpConfWrite['useRe'] === false) {
                    return {'from': tmpConfWrite['from'], 'to': tmpConfWrite['to'], 'useRe': false }
                } else {
                    return {'from': new RegExp(tmpConfWrite['from']), 'to': tmpConfWrite['to'], 'useRe': true }
                }
            }
        }
    }

    rebuildCellPath (tmpConfPath, pathUseRe) {
        if (pathUseRe === true) {
            return new RegExp(tmpConfPath)
        } else {
            return tmpConfPath
        }
    }

    rebuildCellPathUseRe (pathUseRe) {
        if (pathUseRe === false) {
            return false
        } else {
            return true
        }
    }

    rebuildCellMethod (methodData) {
        if (methodData === null || methodData === undefined || methodData === '') {
            return null
        } else {
            return methodData
        }
    }

    rebuildCellStatus (resStatus) {
        if (resStatus === undefined || resStatus === null || resStatus === 0 || resStatus === '0') {
            return null
        } else {
            return parseInt(resStatus)
        }
    }

    rebuildCellContent (resContent) {
        // 输出 null 或者 文本
        if (resContent === undefined || resContent === null) {
            return null
        } else {
            if (gettype.call(resContent) === '[Object String]') {
                return resContent
            } else {
                return JSON.stringify(resContent)
            }
        }
    }

    rebuildCellWebHeader (webHeader) {
        if (webHeader === undefined || webHeader === null) {
            return null
        } else {
            return webHeader
        }
    }
    saveConf (content) {
      fs.writeFileSync(this.confFilePath, content)
    }
    loadConfOrg () {
      // 读取文件
      return fs.readFileSync(this.confFilePath, 'utf-8')
      // 解析json
    }

    loadConf () {
        // 读取文件
        let proxyDataJson = fs.readFileSync(this.confFilePath, 'utf-8')
        // 解析json
        let proxyDataOrg = JSON.parse(proxyDataJson)
        // 重建规则
        let pathHub = []
        let tmpStrList = proxyDataOrg['webHost'].split(':')
        proxyDataOrg['webHost'] = tmpStrList[0]
        if (tmpStrList[1] === undefined) {
          proxyDataOrg['webPort'] = "80"
        } else {
          proxyDataOrg['webPort'] = tmpStrList[1]
        }
        let tmpOrgHostPartList = proxyDataOrg['orgHost'].split(':')
        if (tmpOrgHostPartList[1] === undefined) {
          proxyDataOrg['orgHost'] = proxyDataOrg['orgHost'] + ':80'
        }
        let proxyData = {}
        proxyData[proxyDataOrg['orgHost']] = proxyDataOrg


        // 遍历remote主机
        for (let remoteHost in proxyData) {
            if (proxyData.hasOwnProperty(remoteHost)) {
                let hostCell = proxyData[remoteHost]
                // let newList = []
                // for (let i = 0; i < hostCell['proxyList'].length; i++) {
                //     for (let m = 0; m < hostCell['proxyList'][i]["orgPath"].length; m++) {
                //         let tmpSave = JSON.parse(JSON.stringify(hostCell['proxyList'][i]))
                //         tmpSave['path'] = hostCell['proxyList'][i]["orgPath"][m]
                //         newList.push(tmpSave)
                //     }
                // }
                // hostCell['proxyList'] = newList

                for (let i = 0; i < hostCell['proxyList'].length; i++) {
                    // 替换delay
                    let orgCell = hostCell['proxyList'][i]
                    orgCell["resDelay"] = this.rebuildCellDelay(orgCell['resDelay'])
                    orgCell["webRewrite"] = this.rebuildCellRewrite(orgCell['webRewrite'])
                    orgCell['orgUseRe'] = this.rebuildCellPathUseRe(orgCell['orgUseRe'])
                    pathHub.push([orgCell['orgUseRe'], orgCell['orgPath']])
                    orgCell["orgPath"] = this.rebuildCellPath(orgCell['orgPath'], orgCell['orgUseRe'])
                    orgCell["orgMethod"] = this.rebuildCellMethod(orgCell['orgMethod'])
                    orgCell["resStatus"] = this.rebuildCellStatus(orgCell['resStatus'])
                    orgCell["resContent"] = this.rebuildCellContent(orgCell['resContent'])
                    orgCell["webHeader"] = this.rebuildCellWebHeader(orgCell["webHeader"])
                    hostCell['proxyList'][i] = orgCell
                }
                proxyData[remoteHost] = hostCell
            }
        }
        console.log("all path:")
        for (let i = 0; i < pathHub.length; i++) {
            if (pathHub[i][0] === true) {
                console.log(" " + "RE" + "  " + pathHub[i][1])
            } else {
                console.log(" " + "--" + "  " + pathHub[i][1])
            }
        }
        console.log("")
        return proxyData
    }
}

module.exports = confController
