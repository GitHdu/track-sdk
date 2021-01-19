import utils from './utils'
import BatchSend from './core/BatchSend'
import Track from './core/Track'
import gd from './core/gd'
import AutoTrack from './core/autoTrack'
import DeviceDetector from './core/helpers/deviceDetector'

const batch_send_default = {
  datasend_timeout: 6000,
  send_interval: 6000,
  one_send_max_length: 6
}

gd.para_default = {
  // 预置属性
  preset_properties: {
    url: window.location.href,
    url_path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    // time: '',
    screen_height: Number(screen.height) || 0,
    screen_width: Number(screen.width) || 0,
    is_new_user: '0',
    os: DeviceDetector.os.name,
    model: DeviceDetector.device.name,
    os_version: String(DeviceDetector.os.version),
    browser: DeviceDetector.browser.name,
    browser_version: String(DeviceDetector.browser.version)
  } 
},
gd.para = {
  page_enter_or_out_Flag: '',
  lib: {
    lib: 'js',
    lib_method: 'code',
    lib_version: '1.0.0'
  },
  batch_send: false,
  /** 数据上报超时时间 */
  datasend_timeout: 3000,
  /** 上报模式 image | ajax | beacon */
  send_type: 'image',
  /** 是否在控制台打印信息 */
  show_log: false,
  /** 数据上报接口地址 */
  server_url: 'http://192.168.26.73:8089/iop-ps/sdk/data.gif',
  /** 是否单页面应用 */
  is_track_single_page: true,
  /** 捕获到pv事件是否立即触发批量发送 */
  is_pageview_trigger_batch: true
}

gd.store = {
  _state: {
    distinct_id: '', // 用户的唯一标示id
    session_id: ''
  },
  getDistinctId: function() {
    return this._state.distinct_id
  },
  getSessionId: function() {
    return this._state.session_id
  }
}

gd.batchSend = new BatchSend()

gd.track = Track

gd.init = function(params) {
  // 初始化一些全局变量
  this.initVariable()
  // 初始化属性
  if (this.initParams(params) === false) return
  this.initBatchSend()
  this.initDistincId()
  this.initSession()
  // 兼容异步调用，执行用户调用方法
  this.detectMode()
  let para = this.para.preset_properties
  this._para = para
}
gd.detectMode = function() {
  const defineMode = function() {
    if (gd._q && utils.isArray(gd._q) && gd._q.length > 0) {
      utils.each(gd._q, function(content) {
        gd[content[0]].apply(gd, Array.prototype.slice.call(content[1]))
      })
    }
  }
  setTimeout(() => {
    defineMode()
  }, 1000)
}
gd.initVariable = function() {
  // 记录当下时间，用于后面统计页面停留时长
  gd._time = gd._time || new Date().getTime()
}
gd.initParams = function(params) {
  params =  params || gd.customPara || {}
  if (!params.appId) {
    typeof console === 'object' && console.log && console.log('请上传appId，否则无法进行埋点上报，上传后刷新页面重试～')
    return false
  }
  // 预置属性读取配置
  gd.para = utils.extend({}, gd.para, params)
  gd.para.preset_properties = utils.extend({}, gd.para_default.preset_properties, params.preset_properties)
}

gd.initBatchSend = function() {
  if (utils.localStorage.isSupport() && utils.isSupportCors() && typeof localStorage === 'object') {
    if (gd.para.batch_send === true) {
      gd.para.batch_send = utils.extend({}, batch_send_default)
    } else if (typeof gd.para.batch_send === 'object') {
      gd.para.batch_send = utils.extend({}, batch_send_default, gd.para.batch_send)
    }
  } else {
    gd.para.batch_send = false
  }
}

gd.initDistincId = function() {
  let storage_distinct_id = utils.localStorage.isSupport() && localStorage.getItem('getuidata_jssdk_distinct_id')
  // 处理用户自己传入distinct_id
  if (gd.para.distinct_id) {
    gd.store._state.distinct_id = gd.para.distinct_id
    if (storage_distinct_id !== gd.para.distinct_id) {
      gd.para.preset_properties.is_new_user = '1'
      utils.localStorage.isSupport() && localStorage.setItem('getuidata_jssdk_distinct_id', gd.store.getDistinctId())
    }
    return
  } 
  
  if (storage_distinct_id) {
    gd.store._state.distinct_id = storage_distinct_id
  } else {
    gd.store._state.distinct_id = utils.getUUID()
    gd.para.preset_properties.is_new_user = '1'
    utils.localStorage.isSupport() && localStorage.setItem('getuidata_jssdk_distinct_id', gd.store.getDistinctId())
  }   
  // console.log('生成用户唯一标示id', gd.store.getDistinctId())
}
gd.initSession = function() {
  let storage_session_id = utils.sessionStorage.isSupport() && sessionStorage.getItem('getuidata_jssdk_session_id')
  if (storage_session_id) {
    this.store._state.session_id = storage_session_id
  } else {
    this.store._state.session_id = utils.getUUID().slice(0, 18) + '-' + new Date().getTime().toString(16).slice(-8) + '-' + String(Math.random()).replace('.', '').slice(0, 4)
    // 存储session
    utils.sessionStorage.isSupport() && sessionStorage.setItem('getuidata_jssdk_session_id', gd.store.getSessionId())
  }
}

gd.log = function() {
  if (gd.para.show_log) {
    arguments[0] = utils.formatJsonString(arguments[0])

    if (typeof console === 'object' && console.log) {
      try {
        return console.log.apply(console, arguments)
      } catch (e) {
        console.log(arguments[0])
      }
    }
  }
}

// 预留方法，设置事件公共属性
gd.registerPage = function() {
}
// 预留方法，设置用户属性
gd.setProfile = function() {
}
// 打开自动监测PV，UV功能
gd.autoTrack = function() {
  // 开启PV监测
  AutoTrack.trackSinglePage(gd.para.is_track_single_page)
  // 监听页面关闭，发送页面停留时间
  AutoTrack.trackClosePage()
  if (this.para.batch_send) {
    this.batchSend.batchInterval()
  } else {
    gd.track('$PageView', gd.para.preset_properties)
  }
}

gd.setPreConfig = function(ga) {
  gd.customPara = ga.customPara
  gd._q = ga._q
}

if (typeof window['GetuiData'] === 'string') {
  gd.setPreConfig(window[window.GetuiData])
  window[window.GetuiData] = gd
  window['GetuiData'] = gd
  gd.init()
} else if (typeof window['GetuiData'] === 'undefined') {
  window['GetuiData'] = gd
} else {
  // gd = window['GetuiData']
  Object.assign(gd, window['GetuiData'])
}

export default gd
