'use strict'
const bodyParser = require('body-parser')
const express = require('express')
class webHubController {
  constructor(appHubObject) {
    let apiObject = this.getApi(appHubObject)
    this.setWeb(apiObject)
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
