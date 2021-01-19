const ArrayProto = Array.prototype
const ObjProto = Object.prototype
const breaker = {}
const hasOwnProperty = ObjProto.hasOwnProperty
const nativeForEach = ArrayProto.forEach
const nativeIsArray = Array.isArray
const slice = ArrayProto.slice

export default  {
  each: function(obj, iterator, context) {
    if (obj == null) {
      return false
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context)
    } else if (obj.length === +obj.length) {
      for (let i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
          return false
        }
      }
    } else {
      for (let key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) {
            return false
          }
        }
      }
    }
  },

  extend: function(obj) {
    this.each(slice.call(arguments, 1), function(source) {
      for (let prop in source) {
        if (source[prop] !== void 0) {
          obj[prop] = source[prop]
        }
      }
    })
    return obj
  },

  formatJsonString: function(obj) {
    try {
      return JSON.stringify(obj, null, '  ')
    } catch (e) {
      return JSON.stringify(obj)
    }
  },

  getReferrer: function(referrer) {
    referrer = referrer || document.referrer

    if (typeof referrer !== 'string') {
      return '取值异常_referrer异常_' + String(referrer)
    }
    if (referrer.indexOf('https://www.baidu.com/') === 0) {
      referrer = referrer.split('?')[0]
    }

    return (typeof referrer === 'string' ? referrer : '')
  },

  indexOf: function(arr, target) {
    const indexof = arr.indexOf
    if (indexof) {
      return indexof.call(arr, target)
    } else {
      for (let i = 0; i < arr.length; i++) {
        if (target === arr[i]) {
          return i
        }
      }
      return -1
    }
  },

  isArray: nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]'
  },

  isBoolean: function(obj) {
    return toString.call(obj) == '[object Boolean]'
  },

  isDate: function(obj) {
    return toString.call(obj) == '[object Date]'
  },

  isFunction: function(f) {
    if (!f) {
      return false
    }
    try {
      return /^\s*\bfunction\b/.test(f)
    } catch (x) {
      return false
    }
  },

  isNumber: function(obj) {
    return (toString.call(obj) == '[object Number]' && /[\d.]+/.test(String(obj)))
  },

  isObject: function(obj) {
    if (obj == null) {
      return false
    } else {
      return (toString.call(obj) == '[object Object]')
    }
  },

  isString: function(obj) {
    return toString.call(obj) == '[object String]'
  },

  isSupportCors: function() {
    if (typeof window.XMLHttpRequest === 'undefined') {
      return false
    }
    if ('withCredentials' in new XMLHttpRequest()) {
      return true
    } else if (typeof XDomainRequest !== 'undefined') {
      return true
    } else {
      return false
    }
  },

  safeJSONParse: function(str) {
    let val = null
    try {
      val = JSON.parse(str)
    } catch (e) {
      return false
    }
    return val
  },

  utf8Encode: function(string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    let utftext = '',
      start, end
    let stringl = 0,
      n

    start = end = 0
    stringl = string.length

    for (n = 0; n < stringl; n++) {
      const c1 = string.charCodeAt(n)
      let enc = null

      if (c1 < 128) {
        end++
      } else if ((c1 > 127) && (c1 < 2048)) {
        enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128)
      } else {
        enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128)
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.substring(start, end)
        }
        utftext += enc
        start = end = n + 1
      }
    }

    if (end > start) {
      utftext += string.substring(start, string.length)
    }

    return utftext
  }
}