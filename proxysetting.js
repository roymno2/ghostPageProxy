 // p(文本数组，必填) 表示什么路径时触发此规则, {param}表示一段长度不为0的非正斜杠字符
  // addEnd(布尔，默认为false) 为true时，p会在自动追加$，具体含义参见正则表达式
  // prefix(文本，默认为空文本) 不为空文本时，将会追加到p前面
  // svr(文本数组，必填) 表示当访问哪些服务器时开始检查是否触发这条规则
  // delay(整数，默认为0) 表示延迟多少毫秒返回
  // rep(对象, 默认为null) 不为null时表示内容从什么服务器引流，不为null时必填web
  // rewrite(对象，默认为null) 为null时表示请求内容时不修改请求路径， 不为null指导如何改写请求内容时的路径, default默认为false，为true时忽略from和to的设定转而使用defaultRewrite，还有个可选参数useRe为布尔，默认为true，表示是否将rewrite中的from当做正则理解
  // web(文本，必填) 表示从哪个服务器请求路径, 写webSvr中的或者remoteSvr中的都可以
  // statusCode(整数，默认为0) 不为0时表示将返回的状态码锁定为什么
  // contentFunc(回调函数，默认为null) 表示调用什么函数来替换内容, 返回必须为文本，resData不为null，rep自动失效，contentFunc执行时不会自动修改statusCode, 但可以修改statusCode，headers中content-length会被自动修改，所以在contentFunc中修改content-length都会被覆盖
  // cutQuery(布尔，默认为true) 为true表示比对p时先切割掉query参数，留下纯路径部分
  // rePath(布尔，默认为true) 是否按照正则去理解p的元素, true时按照正则处理, 考虑到正则比对还是比纯文本比对慢一点，所以增加了这个选项

let controllerInfoDev = {
  webSvr: {
    web1: {
      host: '127.0.0.1',
      port: 8080
    },
  },
  remoteSvr: {
    remote1: {
      host: '192.168.1.10',
      port: 80
    }
  },
  // 默认前端
  defaultLocal: 'web1',
  // 默认后端
  defaultRemote: 'remote1',
  // defaultRewrite应该是个对象，包含from和to, 不想写时
  defaultRewrite: {from: '/test', to: '/'},
  // defaultRewrite: null,
  // 用于修改请求路径
  proxyList: [
    {p: [
      'index',
      'setting',
    ], addEnd: true, prefix: '^/test/', svr: ["default"], delay: 0, rep: { rewrite: null, web: "default"}},
    {p: ['static/.*'], prefix: '^/', svr: ["default"], delay: 0, rep: { rewrite: null, web: "default"}},
    {p: ['app.js'], prefix: '^/', svr: ["default"], delay: 0, rep: { rewrite: null, web: "default"}},
    {p: ['/__webpack_hmr'], svr: ["default"], delay: 0, rep: { rewrite: null, web: "default"}},
  ]
}

var controllerInfo = controllerInfoDev