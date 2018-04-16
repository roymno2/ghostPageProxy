ghostPageProxy v4.0

基于anyproxy4.0.6
这次的anyproxy并没有被魔改，所以需要的话可升级
需要node环境，至少为nodejs 6.0
执行start.bat中的命令来启动服务
服务无法启动时请检查proxysetting.js并检查是否有其他服务占用了8084和8002端口
proxysetting.js与之前的版本的代理并不通用，不要拿过来直接使

浏览器需要按照代理插件或配置代理后方能使用，配置见截图

// p(文本数组，必填) 表示什么路径时触发此规则, {param}表示一段长度不为0的非正斜杠字符
// addEnd(布尔，默认为false) 为true时，p会在自动追加$，具体含义参见正则表达式
// prefix(文本，默认为空文本) 不为空文本时，将会追加到p前面
// svr(文本数组，必填) 表示当访问哪些服务器时开始检查是否触发这条规则
// delay(整数，默认为0) 表示延迟多少毫秒返回
// rep(对象, 默认为null) 不为null时表示内容从什么服务器引流，不为null时必填web
// rep下属rewrite(对象，默认为null) 为null时表示请求内容时不修改请求路径， 不为null指导如何改写请求内容时的路径, default默认为false，为true时忽略from和to的设定转而使用defaultRewrite，还有个可选参数useRe为布尔，默认为true，表示是否将rewrite中的from当做正则理解
// rep下属web(文本，必填) 表示从哪个服务器请求路径
// statusCode(整数，默认为0) 不为0时表示将返回的状态码锁定为什么
// contentFunc(回调函数，默认为null) 表示调用什么函数来替换内容, 返回必须为文本，resData不为null，rep自动失效，contentFunc执行时不会自动修改statusCode, 但可以修改statusCode，headers中content-length会被自动修改，所以在contentFunc中修改content-length都会被覆盖

{p: ['visualization'], prefix: '^/ezsonar/apm/', svr: ["default"], delay: 0, statusCode: 404, rep: { rewrite: {default: true, from: '.*', to: '/ezsonar/apm/index.html', useRe: true}, web: "default"}, contentFunc: function (resData) {
       return ['hello']
}}

如果是转发给前端的请求，会在终端上以这样的形式展示
>>> send to front -> GET http://127.0.0.1:80/ezsonar/apm/index.html

如果是contentFunc的返回值不是文本，则以这样的形式展示
>>>!!!!
contentFunc not return string
<<<!!!!

直接让所有流量通过anyproxy也不是不行，但是会巨慢，不建议这么做