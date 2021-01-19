const EventListener = {}
function fixEvent(event) {
  if (event) {
    event.preventDefault = fixEvent.preventDefault
    event.stopPropagation = fixEvent.stopPropagation
    event._getPath = fixEvent._getPath
  }
  return event
}
fixEvent._getPath = function() {
  var ev = this
  var polyfill = function() {
    try {
      var element = ev.target
      var pathArr = [element]
      if (element === null || element.parentElement === null) {
        return []
      }
      while (element.parentElement !== null) {
        element = element.parentElement
        pathArr.unshift(element)
      }
      return pathArr
    } catch (err) {
      return []
    }

  }
  return this.path || (this.composedPath && this.composedPath()) || polyfill()
}
fixEvent.preventDefault = function() {
  this.returnValue = false
}
fixEvent.stopPropagation = function() {
  this.cancelBubble = true
}
EventListener.addEvent = function() {
  var register_event = function(element, type, handler) {
    if (element && element.addEventListener) {
      element.addEventListener(type, function(e) {
        e._getPath = fixEvent._getPath
        handler.call(this, e)
      })
    } else {
      var ontype = 'on' + type
      var old_handler = element[ontype]
      element[ontype] = makeHandler(element, handler, old_handler)
    }
  }

  function makeHandler(element, new_handler, old_handlers) {
    var handler = function(event) {
      event = event || fixEvent(window.event)
      if (!event) {
        return undefined
      }
      event.target = event.srcElement

      var ret = true
      var old_result, new_result
      if (typeof old_handlers === 'function') {
        old_result = old_handlers(event)
      }
      new_result = new_handler.call(element, event)
      if ((false === old_result) || (false === new_result)) {
        ret = false
      }
      return ret
    }
    return handler
  }

  register_event.apply(null, arguments)
}

export default { EventListener }