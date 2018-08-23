'use strict';
var express = require("express");
var confController = require('./libConf')
var libBase = require('./libBase')

var app = express();

class appHubController {
    //构造函数
    constructor() {
        this.recordCountNum = 0;
        this.recordHistoryLimit = 500;
        // 请求缓存池，最近500条
        this.recordHistoryList = [];
        this.proxySettingController = new confController()
        this.proxyConf = this.proxySettingController.loadConf()
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
                if (hostProxyConfCell["proxyList"][i]['method'] === null || orgMethod === hostProxyConfCell["proxyList"][i]['method']) {
                    if (hostProxyConfCell["proxyList"][i].pathUseRe === true) {
                        // 如果使用正则匹配模式
                        if (hostProxyConfCell["proxyList"][i]['path'].test(orgPath)) {
                            return this.matchProxyOutConf(hostProxyConfCell, i, orgPath, orgMethod, requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port)
                        }
                    } else if (orgPath.startsWith(hostProxyConfCell["proxyList"][i]['path'])) {
                        // 如果是非正则匹配模式，且命中的话
                        return this.matchProxyOutConf(hostProxyConfCell, i, orgPath, orgMethod, requestDetail.requestOptions.hostname + ':' + requestDetail.requestOptions.port)
                    }
                }
            }
        }
        return null
    }

    matchProxyOutConf(hostProxyConfCell, idIndex, orgPath, orgMethod, orgHost) {
        let newPath = orgPath
        if (hostProxyConfCell["proxyList"][idIndex]["reqRewrite"] !== null) {
            newPath = orgPath.replace(hostProxyConfCell["proxyList"][idIndex]["reqRewrite"]['from'], hostProxyConfCell["proxyList"][idIndex]["reqRewrite"]['to'])
        }
        return {
            "webHost": hostProxyConfCell["webHost"],
            "webPort": hostProxyConfCell["webPort"],
            "resDelay": hostProxyConfCell["proxyList"][idIndex]["resDelay"],
            "reqRewrite": hostProxyConfCell["proxyList"][idIndex]["reqRewrite"],
            "resContent": hostProxyConfCell["proxyList"][idIndex]["resContent"],
            "resStatus": hostProxyConfCell["proxyList"][idIndex]["resStatus"],
            "reqHeader": hostProxyConfCell["proxyList"][idIndex]["reqHeader"],
            "reqMethod": orgMethod,
            "reqHost": orgHost,
            "reqPath": orgPath,
            "newPath": newPath
        }
    }

    runProxyForward (proxyInfo, requestDetail, responseDetail) {
        if (proxyInfo["reqPath"] === proxyInfo["newPath"]) {
            console.log("  send >> " + proxyInfo["reqMethod"] + " " + proxyInfo["reqHost"] + proxyInfo["reqPath"] + " ->> " + proxyInfo["webHost"] + ':' + proxyInfo["webPort"])
        } else {
            console.log("  send >> " + proxyInfo["reqMethod"] + " " + proxyInfo["reqHost"] + proxyInfo["reqPath"] + " ->> " + proxyInfo["webHost"] + ':' + proxyInfo["webPort"] + proxyInfo["newPath"])
        }
        console.log("")
        return libBase.responseContentReplace(proxyInfo, requestDetail, responseDetail)
        // return null
    }

    recordCountAdd () {
        this.recordCountNum = this.recordCountNum + 1;
    }


    recordListAdd (requestDetail) {
        // { requestOptions:
        // { hostname: 'anyproxy.io',
        //   port: 80,
        //   path: '/assets/favicon.png',
        //   method: 'GET',
        //   headers:
        //   { Host: 'anyproxy.io',
        //     'Proxy-Connection': 'keep-alive',
        //     Pragma: 'no-cache',
        //     'Cache-Control': 'no-cache',
        //     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
        //     Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
        //     Referer: 'http://anyproxy.io/cn/',
        //     'Accept-Encoding': 'gzip, deflate',
        //     'Accept-Language': 'zh-CN,zh;q=0.9',
        //     Cookie: 'Hm_lvt_4e51565b7d471fd6623c163a8fd79e07=1534127336; Hm_lpvt_4e51565b7d471fd6623c163a8fd79e07=1534132108' } },
        // }

        let tmpReqInfo = {
            host: requestDetail.requestOptions.hostname + ":" + requestDetail.requestOptions.port,
            path: requestDetail.requestOptions.path,
            method: requestDetail.requestOptions.method
        };
        let path_split_index = requestDetail.requestOptions.path.indexOf("?");
        if (path_split_index > -1) {
            tmpReqInfo["path_path"] = requestDetail.requestOptions.path.substring(0,path_split_index);
            tmpReqInfo["path_parm"] = requestDetail.requestOptions.path.substring(path_split_index + 1, requestDetail.requestOptions.path.length)
        } else {
            tmpReqInfo["path_path"] = requestDetail.requestOptions.path;
            tmpReqInfo["path_parm"] = ""
        }
        if (requestDetail.requestOptions.headers.hasOwnProperty('Accept-Encoding')) {
            tmpReqInfo['zip'] = requestDetail.requestOptions.headers['Accept-Encoding'];
        } else {
            tmpReqInfo['zip'] = "";
        }
        // 加入缓存
        this.recordHistoryList.unshift(tmpReqInfo);
        this.recordListClean()
    }

    recordListClean () {
        let outLen = this.recordHistoryList.length - this.recordHistoryLimit;
        if (outLen > 0) {
            this.recordHistoryList.splice(this.recordHistoryLimit - 1, outLen)
        }
    }

    setRouter() {
        const router = express.Router();
        router.get('/get_count', (req, res) => {
            try {
                res.json(this.recordCountNum)
            } catch (e) {
                res.json("error")
            }
        });
        router.get('/get_history_list', (req, res) => {
            try {
                res.json(this.recordHistoryList)
            } catch (e) {
                res.json("error")
            }
        });
        // router.get('/detail', (req, res) => {
        //   try {
        //     res.json(comConf)
        //   } catch (e) {
        //     res.json("error")
        //   }
        // })
        app.use("/api", router);
        app.listen(12000, function (err) {
            if (err) {
                console.log(err);
                return null;
            }
        })
    }
}

exports.appHubController = appHubController;
