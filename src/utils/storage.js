import gd from '../core/gd'
const Storage = {
  sessionStorage: {
    isSupport: function() {
      let supported = true

      const key = 'GD_TRACKING_SUPPORT'
      const val = 'testIsSupportStorage'
      try {
        if (sessionStorage && sessionStorage.setItem) {
          sessionStorage.setItem(key, val)
          sessionStorage.removeItem(key, val)
          supported = true
        } else {
          supported = false
        }
      } catch (e) {
        supported = false
      }
      return supported
    }
  },
  localStorage: {
    get: function(name) {
      return window.localStorage.getItem(name)
    },

    parse: function(name) {
      let storedValue
      try {
        storedValue = JSON.parse(this.get(name)) || null
      } catch (err) {
        gd.log(err)
      }
      return storedValue
    },

    set: function(name, value) {
      window.localStorage.setItem(name, value)
    },

    remove: function(name) {
      window.localStorage.removeItem(name)
    },

    isSupport: function() {
      let supported = true
      try {
        const key = 'GD_TRACKING_SUPPORT'
        const val = 'testIsSupportStorage'
        this.set(key, val)
        if (this.get(key) !== val) {
          supported = false
        }
        this.remove(key)
      } catch (err) {
        supported = false
      }
      return supported
    }

  }
}
export default Storage