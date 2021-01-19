import utils from '../../utils'
import gd from '../gd'

const dataSend = {}

/**
 * 对上报数据编码，并拼接出请求图片的地址，因为通过图片方式上报只能通过get方式
 * @param {*} data 
 */
dataSend.getSendUrl = function(data) {
  const url = gd.para.server_url
  const base64Data = utils.base64Encode(data)

  if (url.indexOf('?') !== -1) {
    return url + '&data=' + encodeURIComponent(base64Data)
  } else {
    return url + '?data=' + encodeURIComponent(base64Data)
  }
}

/**
 * 对上报数据编码，生成post请求参数
 * @param {*} data 
 */
dataSend.getSendData = function(data) {
  const base64Data = utils.base64Encode(data)

  return 'data=' + encodeURIComponent(base64Data)
}

/**
 * 包装请求实例，返回一个适用于队列的实例
 * 实例统一通过调用isEnd方法结束请求流程，触发callback并辅助队列关闭
 * @param {*} data 
 */
dataSend.getInstance = function(data) {
  const sendType = this.getSendType()
  const obj = new this[sendType](data)
  const start = obj.start
  obj.start = function() {
    start.apply(this, arguments)
  }
  obj.end = function() {
    this.callback && this.callback()
    const self = this
    self.lastClear && self.lastClear()
  }
  obj.isEnd = function() {
    if (!this.received) {
      this.received = true
      this.end()
      // 外部定义了实例的close方法为关闭队列，请求流程结束时手动触发辅助队列关闭
      this.close()
    }
  }

  return obj
}

/**
 * 默认通过image方式上报，可选ajax或beacon，环境不支持定义的上报模式时，自动变更为image方式上报
 */
dataSend.getSendType = function() {
  const supportedSendTypes = ['image', 'ajax', 'beacon']
  let sendType = supportedSendTypes[0]

  sendType = gd.para.send_type

  if (sendType === 'beacon' && typeof navigator.sendBeacon !== 'function') {
    sendType = 'image'
  }

  if (sendType === 'ajax' && utils.isSupportCors() === false) {
    sendType = 'image'
  }

  return sendType
}

dataSend.image = function(para) {
  this.callback = para.callback
  this.img = document.createElement('img')
  this.img.width = 1
  this.img.height = 1
  if (gd.para.img_use_crossorigin) {
    this.img.crossOrigin = 'anonymous'
  }
  this.data = para.data
  this.server_url = dataSend.getSendUrl(para.data)
}
dataSend.image.prototype.start = function() {
  const me = this
  this.img.onload = function() {
    this.onload = null
    this.onerror = null
    this.onabort = null
    me.isEnd()
  }
  this.img.onerror = function() {
    this.onload = null
    this.onerror = null
    this.onabort = null
    me.isEnd()
  }
  this.img.onabort = function() {
    this.onload = null
    this.onerror = null
    this.onabort = null
    me.isEnd()
  }
  this.img.src = this.server_url
}
dataSend.image.prototype.lastClear = function() {
  this.img.src = ''
}

dataSend.ajax = function(para) {
  this.callback = para.callback
  this.server_url = gd.para.server_url
  this.data = dataSend.getSendData(para.data)
}
dataSend.ajax.prototype.start = function() {
  const me = this
  utils.ajax({
    url: this.server_url,
    type: 'POST',
    data: this.data,
    credentials: false,
    timeout: gd.para.datasend_timeout,
    cors: true,
    success: function() {
      me.isEnd()
    },
    error: function() {
      me.isEnd()
    }
  })
}

dataSend.beacon = function(para) {
  this.callback = para.callback
  this.server_url = gd.para.server_url
  this.data = dataSend.getSendData(para.data)
}
dataSend.beacon.prototype.start = function() {
  const me = this
  if (typeof navigator === 'object' && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(this.server_url, this.data)
  }
  setTimeout(function() {
    me.isEnd()
  }, 40)
}

export default dataSend