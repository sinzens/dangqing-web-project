export default {
  invertKeyValues (obj: Record<string, string> | Map<string, string>) {
    const isMap = 'get' in obj
    if (!isMap) {
      return Object.keys(obj).reduce(
        (inverted: Record<string, string>, key) => {
          inverted[(obj as Record<string, string>)[key]] = key
          return inverted
        }, Object())
    } else {
      const map = new Map<string, string>();
      (obj as Map<string, string>).forEach((value, key) => {
        map.set(value, key)
      })
      return map
    }
  },

  numberArrayFromRange (start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, index) => {
      return index + start
    })
  },

  numberTextArrayFromRange (start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, index) => {
      return `${index + start}`
    })
  },

  mapToObject (map: Map<string, unknown>) {
    const obj = Object()
    map.forEach((value, key) => {
      obj[key] = value
    })
    return obj as Record<string, unknown>
  },

  objectToMap (obj: Record<string, unknown>) {
    const map = new Map<string, unknown>()
    for (const key in obj) {
      map.set(key, obj[key])
    }
    return map
  },

  isNonnegativeFloat (value: number | string) {
    return String(value).match(RegExp(/^(?:[1-9]\d*|0)?(?:\.\d+)?$/)) !== null
  },

  isPositiveInt (value: number | string) {
    return String(value).match(RegExp(/^[1-9]\d*$/)) !== null
  }
}
