
var fs = require('fs')
var libConfigRebuild = require('./libConfigRebuild')
var gettype = Object.prototype.toString
// 设计目标是读取和保存配置文件，并使配置封装在自己这边
class confController {
    //构造函数
    constructor() {
        this.confFilePath = './build/proxysetting.json'
    }

    saveConfOrg (content) {
        // 以原始形式保存文件内容
        fs.writeFileSync(this.confFilePath, content)
    }
    loadConfOrg () {
        // 读取文件原始内容
        return fs.readFileSync(this.confFilePath, 'utf-8')
        // 解析json
    }

    loadConf () {
        // 读取文件
        let proxyDataJson = fs.readFileSync(this.confFilePath, 'utf-8')
        // 解析json
        let proxyDataOrg = JSON.parse(proxyDataJson)
        // 重建规则
        let proxyData = {}
        for (let i = 0; i < proxyDataOrg['hostSetting'].length; i++) {
          if (proxyDataOrg['hostSetting'][i]['enableHost'] === true) {
            let outBuildHostSetting = this.loadConfigCellMain(proxyDataOrg['hostSetting'][i])
            proxyData[outBuildHostSetting['orgHost']] = outBuildHostSetting
          } else {
            console.log(proxyDataOrg['hostSetting'][i]['orgHost'], proxyDataOrg['hostSetting'][i]['enableHost'])
          }
        }
        return proxyData
    }

    loadConfigCellPrepare (proxyDataCellOrg) {
        // 重建规则
        let tmpStrList = proxyDataCellOrg['webHost'].split(':')
        proxyDataCellOrg['webHost'] = tmpStrList[0]
        if (tmpStrList[1] === undefined) {
          proxyDataCellOrg['webPort'] = "80"
        } else {
          proxyDataCellOrg['webPort'] = tmpStrList[1]
        }
        tmpStrList = proxyDataCellOrg['orgHost'].split(':')
        if (tmpStrList[1] === undefined) {
          proxyDataCellOrg['orgHost'] = proxyDataCellOrg['orgHost'] + ':80'
        }
        return proxyDataCellOrg
    }

    loadConfigCellMain (proxyDataCellOrg) {
        proxyDataCellOrg = this.loadConfigCellPrepare(proxyDataCellOrg)
        let outConfigList = []
        for (let i = 0; i < proxyDataCellOrg['proxyList'].length; i++) {
          if (proxyDataCellOrg['proxyList'][i]['enable'] === true) {
            // 替换delay
            let orgCell = proxyDataCellOrg['proxyList'][i]
            orgCell["resDelay"] = libConfigRebuild.rebuildCellDelay(orgCell['resDelay'])
            orgCell["webRewrite"] = libConfigRebuild.rebuildCellRewrite(orgCell['webRewrite'])
            orgCell['orgUseRe'] = libConfigRebuild.rebuildCellPathUseRe(orgCell['orgUseRe'])
            orgCell["orgPath"] = libConfigRebuild.rebuildCellPath(orgCell['orgPath'], orgCell['orgUseRe'])
            orgCell["orgMethod"] = libConfigRebuild.rebuildCellMethod(orgCell['orgMethod'])
            orgCell["resStatus"] = libConfigRebuild.rebuildCellStatus(orgCell['resStatus'])
            orgCell["resContent"] = libConfigRebuild.rebuildCellContent(orgCell['resContent'])
            orgCell["webHeader"] = libConfigRebuild.rebuildCellWebHeader(orgCell["webHeader"])
            outConfigList.push(orgCell)
          }
        }
        proxyDataCellOrg['proxyList'] = outConfigList
        return proxyDataCellOrg
    }
}

module.exports = confController
