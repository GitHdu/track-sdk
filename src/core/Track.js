import gdEvent from './helpers/gdEvent'

/**
 * 单条上报
 * @param {*} event $PageView
 * @param {*} properties 
 * @param {*} callback 在上报请求完成后触发
 */
function Track(event, properties, callback) {
  gdEvent.send({
    type: 'track',
    event,
    properties
  }, callback)
}

export default Track