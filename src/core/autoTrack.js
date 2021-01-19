import PageViewHandler from './helpers/pageViewHandler'
import _ from '../utils'
import gd from './gd'

const autoTrack = {}
/**
 * 自动监听单页面路由切换事件，发送当前页面停留时长，以及下一页面PV埋点请求
 * @param { Boolean } trackSinglePageTurnOn 是否开启单页监测，默认为开启
 */
autoTrack.trackSinglePage = function(trackSinglePageTurnOn) {
  if (trackSinglePageTurnOn) {
    PageViewHandler.addSinglePageEvent((last_url, last_para) => {
      let currentTime = new Date().getTime()
      let stayTime = currentTime - gd._time
      console.log('stayTime', stayTime)
      if (last_url !== location.href) {
        // 发送上个页面停留时长
        gd.track('$PageStay', _.extend(last_para, {
          page_stay_time: stayTime
        }))
        // 发送新页面PV
        let currentPara = _.extend(gd.para.preset_properties, {
          url: location.href,
          url_path: location.pathname,
          title: document.title,
          referrer: last_url // 没有用document.referrer
        })
        gd.track('$PageView', currentPara)
        // 更新时间和参数
        gd._time = currentTime
        gd._para = currentPara
      }
    })
  }
}

/**
 * 自动监听页面关闭事件，发送当前页面停留时长
 */
autoTrack.trackClosePage = function() {
  PageViewHandler.addUnloadEvent(() => {
    let currentTime = new Date().getTime()
    let stayTime = currentTime - gd._time
    let para = _.extend(gd._para, {
      page_stay_time: stayTime
    })
    gd.track('$PageStay', para)
  })
}
export default autoTrack