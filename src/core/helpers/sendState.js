import utils from '../../utils'
import gd from '../gd'
import dataSend from './dataSend'

const sendState = {}
/** 为上报行为生成一个队列，逐个上报 */
sendState.queue = utils.autoExeQueue()

/**
 * 检查batch_send参数来判断上报模式（单条上报 or 批量上报）并在控制台输出上报数据
 * @param {*} data 
 * @param {*} callback 
 */
sendState.getSendCall = function(data, callback) {
  if (gd.para.batch_send && localStorage.length < 200) {
    gd.log(data)
    gd.batchSend.add(data)
    return false
  }

  this.sendCall(data, callback)

  gd.log(data)
}

sendState.sendCall = function(data, callback) {
  this.pushSend({
    data: JSON.stringify(data),
    callback
  })
}

/**
 * 生成一个请求实例，并放入上报队列中逐个上报
 * @param {*} para 包含了要发送的data和callback
 */
sendState.pushSend = function(para) {
  const instance = dataSend.getInstance(para)
  const me = this
  instance.close = function() {
    me.queue.close()
  }
  this.queue.enqueue(instance)
}

export default sendState