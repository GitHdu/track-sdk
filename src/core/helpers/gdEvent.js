import utils from '../../utils'
import gd from '../gd'
import sendState from './sendState'

const gdEvent = {}

/**
 * 对要发送的参数进行包装，加入默认参数，封装成统一格式
 * @param {*} p 
 * type: 'track'
 * event: '$PageView'
 * properties
 * @param {*} callback 
 */
gdEvent.send = function(p, callback) {
  const data = {
    appId: gd.para.appId,
    /** 在gd.store.init的时候生成 */
    distinct_id: gd.store.getDistinctId(),
    session_id: gd.store.getSessionId(),
    lib: gd.para.lib,
    properties: {},
    time: (new Date()) * 1
  }

  utils.extend(data, p)

  sendState.getSendCall(data, callback)
}

export default gdEvent