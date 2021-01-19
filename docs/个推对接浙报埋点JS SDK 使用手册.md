# 个推埋点JS SDK 使用手册
> 个推sdk的源码cdn链接为https://cdn-getuigw.getui.com/iopsdk/getuidata.min.js

## 1. 集成个推埋点js sdk

* 异步载入
将以下代码放入 html 的 head 里面，需要放在稍微靠前点的位置。在使用 GetuiDataSDK.autoTrack() 时，只要保证写在上面引用的代码的下面就可以，不需要等 window.onload 后再执行。
```javascript
<script>
  (function (para) {
    var w = window, n = para.name;
    w['GetuiData'] = n;
    w[n] = w[n] || function(a) {return function() {(w[n]._q = w[n]._q || []).push([a, arguments]);}};
    var ifs = ['init', 'track', 'autoTrack'];
    for (var i = 0; i < ifs.length; i++) {
      w[n][ifs[i]] = w[n].call(null, ifs[i]);
    }
    var s =document.createElement('script');
    s.type='text/javascript';
    s.async=true;
    s.src=para.sdk_url;
    var x =document.getElementsByTagName('script')[0];
    w[n].customPara = para;
    x.parentNode.insertBefore(s, x);
  })({
    sdk_url: 'https://cdn-getuigw.getui.com/iopsdk/getuidata.min.js',
    name: 'GetuiDataSDK',
    appId: '项目唯一ID',
    server_url: '传入sdk的服务地址url'
  });
  GetuiDataSDK.autoTrack()
</script>
```
立即执行函数的参数配置说明：

参数名  | 参数意义 | 是否必填项 | 默认值 | 类型
------------- | ------------- | ------------- | ------------- | -------------
appId | 项目ID，为不同项目对应的唯一的ID，由个推分配 | 是 | 无 | 字符串
sdk_url | 埋点sdk静态资源的地址 | 是 | 无 | 字符串
distinct_id | 标示不同用户的唯一ID | 否 | sdk根据一定的规则自动生成的一个32位字符串 | 字符串
server_url | 提供埋点sdk服务的url地址 | 是 | 无 | 字符串
batch_send | 是否开启批量上传模式  | 否 | false | 布尔类型或对象
name | 引入个推埋点sdk后的全局引用变量名  | 否 | 'GetuiData' | 字符串
* 同步载入
如果需要把引入代码和 SDK 文件整合在一个文件中，然后在页面头部通过 script src 的方式引入。可以把引入代码改成如下方式，并放在下载下来的 getuidata.min.js 文件前面。
```javascript
 <script src="https://cdn-getuigw.getui.com/iopsdk/getuidata.min.js"></script>
    <script>
      var gd = window.GetuiData
      gd.init({
        appId: '项目唯一ID'',
        server_url: '传入sdk的服务地址url'
        // batch_send: true
      })
      gd.autoTrack()
    </script>
```
init方法参数的配置如下，对比异步引用，少了两个参数name和sdk_url

参数名  | 参数意义 | 是否必填项 | 默认值 | 类型
------------- | ------------- | ------------- | ------------- | -------------
appId | 项目ID，为不同项目对应的唯一的ID，由个推分配 | 是 | 无 | 字符串
distinct_id | 标示不同用户的唯一ID | 否 | sdk根据一定的规则自动生成的一个32位字符串 | 字符串
server_url | 提供埋点sdk服务的url地址 | 是 | 无 | 字符串
batch_send | 是否开启批量上传模式  | 否 | false | 布尔类型或对象
## 2. SDK基本配置
###  2.1 init初始化方法
通过init方法初始化一些必要的参数和一些可配置参数。
具体使用方法见1. 集成个推埋点js sdk
### 2.2 autoTrack方法
该方法自动开启采集上报用户PV，UV事件以及统计每个页面的访问时长的埋点。
GetuiData可替换为在异步调用时初始化传入的name。
```javascript
GetuiData.autoTrack()
```
### 2.3 提供批量上传模式
个推sdk为缓解埋点服务器的压力，提供批量上传的模式供用户来选择。
打开批量上传的方式为在init方法中设置batch_send，batch_send有两种设置方式：
* 设置为布尔类型的true，表示打开批量上传模式，并使用个推sdk推荐的默认配置；
```javascript
batch_send: true
```
* 设置为object，表示打开批量上传模式，并设置用户自定义的参数值：
```javascript
batch_send: {
  datasend_timeout: 1000,
  send_interval: 1000,
  one_send_max_length: 6
}
```
以上参数配置说明如下表：

参数名  | 参数意义 | 是否必填项 | 默认值 | 类型
------------- | ------------- | ------------- | ------------- | -------------
datasend_timeout | 批量上传接口响应超时时间，单位为毫秒 | 否 | 6000 | 数值
send_interval | 批量上传发送请求间隔时间，单位为毫秒 | 否 | 6000 | 数值
one_send_max_length | 单次发送埋点记录条数 | 否 | 6 | 数值
