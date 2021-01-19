import _ from '../../utils'
import gd from '../gd'

const PageViewHandler = {}
/**
 * 监听单页面路由切换事件
 * @param { Function } callback 
 */
PageViewHandler.addHashEvent = function(callback) {
  var hashEvent = ('pushState' in window.history ? 'popstate' : 'hashchange')
  _.EventListener.addEvent(window, hashEvent, callback)
}

/**
 * 监听单页面路由切换事件，改写底层默认事件
 * @param { Function } callback 
 */
PageViewHandler.addSinglePageEvent = function(callback) {
  var current_url = location.href
  var historyPushState = window.history.pushState
  var historyReplaceState = window.history.replaceState

  window.history.pushState = function() {
    historyPushState.apply(window.history, arguments)
    callback(current_url, JSON.parse(JSON.stringify(gd._para)))
    current_url = location.href
  }
  window.history.replaceState = function() {
    historyReplaceState.apply(window.history, arguments)
    callback(current_url, JSON.parse(JSON.stringify(gd._para)))
    current_url = location.href
  }

  var singlePageEvent = historyPushState ? 'popstate' : 'hashchange'
  _.EventListener.addEvent(window, singlePageEvent, function() {
    callback(current_url, JSON.parse(JSON.stringify(gd._para)))
    current_url = location.href
  })
}

/**
 * 监听页面关闭事件
 * @param { Function } callback 
 */
PageViewHandler.addUnloadEvent = function(callback) {
  _.EventListener.addEvent(window, 'unload', function() {
    callback()
  })
}
export default PageViewHandler
