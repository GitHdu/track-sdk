import gd from '../core/gd'

const Util = {
  ajax: function(para) {
    para.timeout = para.timeout || 20000

    para.credentials = (typeof para.credentials) === 'undefined' ? true : para.credentials

    function getJSON(data) {
      if (!data) {
        return ''
      }
      try {
        return JSON.parse(data)
      } catch (e) {
        return {}
      }
    }

    const g = this.xhr(para.cors)

    if (!g) {
      return false
    }

    if (!para.type) {
      para.type = para.data ? 'POST' : 'GET'
    }
    para = this.extend({
      success: function() {},
      error: function() {}
    }, para)

    try {
      if (typeof g === 'object' && ('timeout' in g)) {
        g.timeout = para.timeout
      } else {
        setTimeout(function() {
          g.abort()
        }, para.timeout + 500)
      }
    } catch (e) {
      try {
        setTimeout(function() {
          g.abort()
        }, para.timeout + 500)
      } catch (e2) {
        gd.log(e2)
      }
    }

    g.onreadystatechange = function() {
      try {
        if (g.readyState == 4) {
          if ((g.status >= 200 && g.status < 300) || g.status == 304) {
            para.success(getJSON(g.responseText))
          } else {
            para.error(getJSON(g.responseText), g.status)
          }
          g.onreadystatechange = null
          g.onload = null
        }
      } catch (e) {
        g.onreadystatechange = null
        g.onload = null
      }

    }

    g.open(para.type, para.url, true)

    try {
      if (para.credentials) {
        g.withCredentials = true
      }
      if (this.isObject(para.header)) {
        for (let i in para.header) {
          g.setRequestHeader(i, para.header[i])
        }
      }

      if (para.data) {
        if (!para.cors) {
          g.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
        }
        if (para.contentType === 'application/json') {
          g.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
        } else {
          g.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        }

      }
    } catch (e) {
      gd.log(e)
    }

    g.send(para.data || null)
  },

  /**
   * 入队自动开始
   * 实例结束时手动触发close将当前实例出队并继续尝试启动队列
   */
  autoExeQueue: function() {
    const queue = {
      items: [],
      enqueue: function(val) {
        this.items.push(val)
        this.start()
      },
      dequeue: function() {
        return this.items.shift()
      },
      getCurrentItem: function() {
        return this.items[0]
      },
      isRun: false,
      start: function() {
        if (this.items.length > 0 && !this.isRun) {
          this.isRun = true
          this.getCurrentItem().start()
        }
      },
      close: function() {
        this.dequeue()
        this.isRun = false
        this.start()
      }
    }
    return queue
  },

  base64Encode: function(data) {
    if (typeof btoa === 'function') {
      return btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1)
      }))
    }
    data = String(data)
    const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    let o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
      ac = 0,
      enc = '',
      tmp_arr = []
    if (!data) {
      return data
    }
    data = this.utf8Encode(data)
    do {
      o1 = data.charCodeAt(i++)
      o2 = data.charCodeAt(i++)
      o3 = data.charCodeAt(i++)

      bits = o1 << 16 | o2 << 8 | o3

      h1 = bits >> 18 & 0x3f
      h2 = bits >> 12 & 0x3f
      h3 = bits >> 6 & 0x3f
      h4 = bits & 0x3f
      tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
    } while (i < data.length)

    enc = tmp_arr.join('')

    switch (data.length % 3) {
    case 1:
      enc = enc.slice(0, -2) + '=='
      break
    case 2:
      enc = enc.slice(0, -1) + '='
      break
    }

    return enc
  },
  getUUID: function() {
    var T = function() {
      var d = 1 * new Date(),
        i = 0
      while (d == 1 * new Date()) {
        i++
      }
      return d.toString(16) + i.toString(16)
    }
    var R = function() {
      return Math.random().toString(16).replace('.', '')
    }
    var UA = function() {
      var ua = navigator.userAgent,
        i, ch, buffer = [],
        ret = 0

      function xor(result, byte_array) {
        var j, tmp = 0
        for (j = 0; j < byte_array.length; j++) {
          tmp |= (buffer[j] << j * 8)
        }
        return result ^ tmp
      }

      for (i = 0; i < ua.length; i++) {
        ch = ua.charCodeAt(i)
        buffer.unshift(ch & 0xFF)
        if (buffer.length >= 4) {
          ret = xor(ret, buffer)
          buffer = []
        }
      }

      if (buffer.length > 0) {
        ret = xor(ret, buffer)
      }

      return ret.toString(16)
    }

    var se = String(screen.height * screen.width)
    if (se && /\d{5,}/.test(se)) {
      se = se.toString(16)
    } else {
      se = String(Math.random() * 31242).replace('.', '').slice(0, 8)
    }
    var val = (T().slice(-4) + '-' + R().substr(0, 6) + '-' + UA() + '-' + se.slice(-6) + '-' + T().slice(0, 4))
    if (val) {
      return val
    } else {
      return (String(Math.random()) + String(Math.random()) + String(Math.random())).slice(2, 15)
    }
  },
  xhr: function(cors) {
    if (cors) {
      if (typeof window.XMLHttpRequest !== 'undefined' && ('withCredentials' in new XMLHttpRequest())) {
        return new XMLHttpRequest()
      } else if (typeof XDomainRequest !== 'undefined') {
        return new window.XDomainRequest()
      } else {
        return null
      }
    } else {
      if (typeof window.XMLHttpRequest !== 'undefined') {
        return new XMLHttpRequest()
      }
      if (window.ActiveXObject) {
        try {
          return new window.ActiveXObject('Msxml2.XMLHTTP')
        } catch (d) {
          try {
            return new window.ActiveXObject('Microsoft.XMLHTTP')
          } catch (d) {
            gd.log(d)
          }
        }
      }
    }
  }
}
export default Util