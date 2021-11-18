import config from '../config'

export default new Proxy(console, {
  get(target, prop) {
    if (prop == "debug" && !config.debug) return () => {}
    return Reflect.get(target, prop)
  }
})
