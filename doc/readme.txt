ghostPageProxy v4.0

����anyproxy4.0.6
��ε�anyproxy��û�б�ħ�ģ�������Ҫ�Ļ�������
��Ҫnode����������Ϊnodejs 6.0
ִ��start.bat�е���������������
�����޷�����ʱ����proxysetting.json������Ƿ�����������ռ����8084��8002�˿�
proxysetting.json��֮ǰ�İ汾�Ĵ�����ͨ�ã���Ҫ�ù���ֱ��ʹ

�������Ҫ���մ����������ô������ʹ�ã����ü���ͼ

// p(�ı����飬����) ��ʾʲô·��ʱ�����˹���, {param}��ʾһ�γ��Ȳ�Ϊ0�ķ���б���ַ�
// addEnd(������Ĭ��Ϊfalse) Ϊtrueʱ��p�����Զ�׷��$�����庬��μ�������ʽ
// prefix(�ı���Ĭ��Ϊ���ı�) ��Ϊ���ı�ʱ������׷�ӵ�pǰ��
// svr(�ı����飬����) ��ʾ��������Щ������ʱ��ʼ����Ƿ񴥷���������
// delay(������Ĭ��Ϊ0) ��ʾ�ӳٶ��ٺ��뷵��
// rep(����, Ĭ��Ϊnull) ��Ϊnullʱ��ʾ���ݴ�ʲô��������������Ϊnullʱ����web
// rep����rewrite(����Ĭ��Ϊnull) Ϊnullʱ��ʾ��������ʱ���޸�����·���� ��Ϊnullָ����θ�д��������ʱ��·��, defaultĬ��Ϊfalse��Ϊtrueʱ����from��to���趨ת��ʹ��defaultRewrite�����и���ѡ����useReΪ������Ĭ��Ϊtrue����ʾ�Ƿ�rewrite�е�from�����������
// rep����web(�ı�������) ��ʾ���ĸ�����������·��
// statusCode(������Ĭ��Ϊ0) ��Ϊ0ʱ��ʾ�����ص�״̬������Ϊʲô
// contentFunc(�ص�������Ĭ��Ϊnull) ��ʾ����ʲô�������滻����, ���ر���Ϊ�ı���resData��Ϊnull��rep�Զ�ʧЧ��contentFuncִ��ʱ�����Զ��޸�statusCode, �������޸�statusCode��headers��content-length�ᱻ�Զ��޸ģ�������contentFunc���޸�content-length���ᱻ����

{p: ['visualization'], prefix: '^/ezsonar/apm/', svr: ["default"], delay: 0, statusCode: 404, rep: { rewrite: {default: true, from: '.*', to: '/ezsonar/apm/index.html', useRe: true}, web: "default"}, contentFunc: function (resData) {
       return ['hello']
}}

�����ת����ǰ�˵����󣬻����ն�������������ʽչʾ
>>> send to front -> GET http://127.0.0.1:80/ezsonar/apm/index.html

�����contentFunc�ķ���ֵ�����ı���������������ʽչʾ
>>>!!!!
contentFunc not return string
<<<!!!!

ֱ������������ͨ��anyproxyҲ���ǲ��У����ǻ��������������ô��