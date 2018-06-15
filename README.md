# ghostPageProxy v4.0

用于实时查看前后端分离的的项目中前端使用后端数据的效果
基于anyproxy4.0.6
需要node环境，至少为nodejs 6.0

具体说是为了让vue开发时npm run dev实时结合后端接口准备的，不然每次都要npm run build打成包再看效果。

原理如下

1. 首先配置要响应代理的服务器ip端口和要处理的请求路径，举个例子，设置后端服务器为 192.168.1.2:8080，并设置前端服务器为192.168.1.4:8085，要处理的路径为/helloworld
2. npm run start 启动代理程序，代理地址为127.0.0.1:8084
3. 设置浏览器使用此http代理
4. 在浏览器上访问 192.168.1.2:8080/helloworld
   代理检测到此访问路径命中配置，代理返回此请求之前，向192.168.1.4:8085/helloworld发送请求，并拿到响应，使用此响应的内容和状态码替换掉192.168.1.2:8080/helloworld的响应内容和状态码。

启动代理在项目下执行 npm run start
服务无法启动时请检查proxysetting.js并检查是否有其他服务占用了8084和8002端口

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
