import config from '../config'
import gd from './gd'
import utils from '../utils'

/**
 * 批量发送
 * @constructor BatchSend
 */
class BatchSend {
  constructor() {
    /**
     * @description 执行批量上报的分组数量
     */
    this.sendingData = 0
  }

  add(data) {
    if (utils.isObject(data)) {
      this.writeStore(data)
      // $PageView事件会立即上报，其他事件定时上报
      if (data.event === '$PageView' && gd.para.is_pageview_trigger_batch) {
        this.sendStrategy()
      }
    }
  }

  remove(keys) {
    if (this.sendingData > 0) {
      --this.sendingData
    }
    if (utils.isArray(keys) && keys.length > 0) {
      utils.each(keys, function(key) {
        utils.localStorage.remove(key)
      })
    }
  }

  /**
   * 对每一组数据进行上报，上报成功就清除对应的缓存，不成功就等下次触发批量发送时再上报
   * @param {{keys: [], vals: []}} data 
   */
  send(data) {
    const that = this
    const server_url = utils.isArray(gd.para.server_url) ? gd.para.server_url[0] : gd.para.server_url
    utils.ajax({
      url: server_url,
      type: 'POST',
      data: 'list=' + encodeURIComponent(utils.base64Encode(JSON.stringify(data.vals))),
      credentials: false,
      timeout: gd.para.batch_send.datasend_timeout,
      cors: true,
      success: function(res) {
        // 接口返回的errno为0才表示请求成功
        if (res && res.errno === 0) {
          that.remove(data.keys)
        }
        else {
          if (that.sendingData > 0) {
            --that.sendingData
          }
        }
      },
      error: function() {
        if (that.sendingData > 0) {
          --that.sendingData
        }
      }
    })
  }

  /**
   * 对待上报的数据进行分组
   * @param {{keys: [], vals: []}} data 
   */
  sendPrepare(data) {
    const arr = data.vals
    const maxLen = gd.para.batch_send.one_send_max_length
    const arrLen = arr.length
    if (arrLen > 0) {
      if (arrLen <= maxLen) {
        this.send({
          keys: data.keys,
          vals: arr
        })
      } else {
        for (let i = 0; i * maxLen < arrLen; i++) {
          this.send({
            keys: data.keys.splice(0, maxLen),
            vals: arr.splice(0, maxLen)
          })
        }

      }
    }
  }

  /**
   * 读取store中待上报的数据列表
   */
  sendStrategy() {
    const data = this.readStore()
    if (data.keys.length > 0 && this.sendingData === 0) {
      this.sendingData = Math.ceil(data.vals.length / gd.para.batch_send.one_send_max_length)
      this.sendPrepare(data)
    }
  }

  /** SDK初始化的时候触发该方法定时上报数据 */
  batchInterval() {
    const that = this

    setInterval(function() {
      that.sendStrategy()
    }, gd.para.batch_send.send_interval)
  }

  /**
   * 读取缓存中的待上报数据，不符合预期格式的将被移除
   */
  readStore() {
    const keys = []
    const vals = []
    let val = null
    const len = localStorage.length
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)
      if (key.indexOf(config.GD_TRACKING_JS_SDK_PREFIX) === 0) {
        val = localStorage.getItem(key)
        if (val) {
          val = utils.safeJSONParse(val)
          if (val && utils.isObject(val)) {
            keys.push(key)
            vals.push(val)
          } else {
            localStorage.removeItem(key)
            gd.log('localStorage-数据parse异常' + val)
          }
        } else {
          localStorage.removeItem(key)
          gd.log('localStorage-数据取值异常' + val)
        }
      }
    }
    return {
      keys: keys,
      vals: vals
    }
  }

  writeStore(data) {
    const uuid = String(Math.random()).slice(2, 5) + String(Math.random()).slice(2, 5) + String((new Date()).getTime()).slice(3)
    localStorage.setItem(config.GD_TRACKING_JS_SDK_PREFIX + uuid, JSON.stringify(data))
  }
}

export default BatchSend