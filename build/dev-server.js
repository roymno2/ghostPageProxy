'use strict'
const bodyParser = require('body-parser')
const express = require('express')
var gpWsHistory = ''
var WebSocketServer = require('ws').Server
var wssMain = new WebSocketServer({ port: 8181 })
var wsHandler = undefined
class webHubController {
  constructor(appHubObject) {
    this.initws()
    let apiObject = this.getApi(appHubObject)
    this.setWeb(apiObject)
  }

  initws () {
    try {
      wssMain.on('connection', function (ws) {
        wsHandler = ws
        gpWsHistory = gpWsHistory + 'client connected\n'
        ws.on('message', function (message) {
          gpWsHistory = gpWsHistory + 'client send: \n' + message + '\n'
        })
        ws.on('error', function () {
          gpWsHistory = gpWsHistory + 'connection error \n'
        })
        ws.on('close', function () {
          gpWsHistory = gpWsHistory + 'client close\n'
        })
      })
    } catch (e) {}
  }

  getApi (appHubObject) {
    return function (app) {
      const router = require('express').Router()
      router.post('/getHistory', (req, res) => {
        try {
          res.json(appHubObject.getHistory())
        } catch (e) {
          res.json(null)
        }
      })
      router.post('/resetHistory', (req, res) => {
        try {
          res.json(appHubObject.recordListReset())
        } catch (e) {
          res.json(null)
        }
      })
      router.post('/readConfig', (req, res) => {
        try {
          res.json(appHubObject.loadConf())
        } catch (e) {
          res.json(null)
        }
      })
      router.post('/saveConfig', (req, res) => {
        try {
          appHubObject.saveConf(JSON.stringify(req.body, null, 4))
          res.json(true)
        } catch (e) {
          res.json(null)
        }
      })
      router.post('/getWsHistory', (req, res) => {
        res.json({'data': gpWsHistory, 'state': 0})
      })
      router.post('/clearWsHistory', (req, res) => {
        gpWsHistory = ''
        res.json({'data': '', 'state': 0})
      })
      router.post('/sendWs', (req, res) => {
        wsHandler.send(String(req.body.msg))
        gpWsHistory = gpWsHistory + 'server send: \n' + req.body.msg + '\n'
        res.json({'data': '', 'state': 0})
      })
      router.post('/closeWs', (req, res) => {
        wsHandler.close()
        gpWsHistory = gpWsHistory + 'server 主动关闭\n'
        res.json({'data': '', 'state': 0})
      })
      // router.get('/detail', (req, res) => {
      //   try {
      //     res.json(comConf)
      //   } catch (e) {
      //     res.json("error")
      //   }
      // })
      // for parsing application/json
      app.use(bodyParser.json())
      // for parsing application/x-www-form-urlencoded
      app.use(bodyParser.urlencoded({ extended: true }))
      app.use("/api", router);
    }
  }

  setWeb (apiObject) {
    process.env.EZ_APPNAME = 'ghostPage'

    const Webpack = require('webpack')
    const WebpackDevServer = require('webpack-dev-server')
    const getWebpackConfigPromise = require('./webpack.dev.conf')
    getWebpackConfigPromise(apiObject).then(webpackConfig => {
      const options = {
        contentBase: '../dist',
        host: 'localhost',
        hot: true
      }
      WebpackDevServer.addDevServerEntrypoints(webpackConfig, options)
      const compiler = Webpack(webpackConfig)
      const devServerOptions = Object.assign({}, webpackConfig.devServer, options)
      const server = new WebpackDevServer(compiler, devServerOptions)

      server.listen(devServerOptions.port, devServerOptions.host, () => {
        console.log('compiling...')
      })
    }, error => {
      console.log(error)
    })
  }
}

module.exports = webHubController
