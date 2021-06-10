export default {
  takeNumberFromString (str: string) {
    return parseInt(str.replace(/[^0-9]/ig, ''))
  },

  invertKeyValues (obj: Record<string, string> | Map<string, string>) {
    if (!obj) { return Object() }
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

  isObjectEqualType (
    a: Record<string, unknown>,
    b: Record<string, unknown>
  ) {
    const akeys = new Set(Object.keys(a))
    const bkeys = new Set(Object.keys(b))

    if (akeys.size !== bkeys.size) { return false }
    for (const element of akeys) {
      if (!bkeys.has(element)) { return false }
      if (typeof (a[element]) !== typeof (b[element])) {
        return false
      }
    }

    return true
  },

  objectTypeInfo (obj: Record<string, unknown>) {
    const info = Object() as Record<string, string>
    Object.keys(obj).forEach(key => {
      info[key] = typeof (obj[key])
    })
    return JSON.stringify(info)
  },

  isNonnegativeFloat (value: number | string) {
    return String(value).match(RegExp(/^(?:[1-9]\d*|0)?(?:\.\d+)?$/)) !== null
  },

  isPositiveInt (value: number | string) {
    return String(value).match(RegExp(/^[1-9]\d*$/)) !== null
  },

  isNonnegativeFloatOrUniform (value: number | string) {
    const str = String(value)
    const uniformStart = str.indexOf('uniform')
    if (uniformStart !== -1) {
      return str.match(RegExp(
        /uniform[\s]*\([\s]*[0-9.]+[\s]*,[\s]*[0-9.]+[\s]*\)/
      )) !== null
    } else {
      return this.isNonnegativeFloat(str)
    }
  },

  objectArrayToMap (arr: Record<string, string | number>[], keys: string[]) {
    return new Map(arr.map(element => {
      return [keys.map(key => element[key]).join(','), element]
    }))
  },

  getInsertSql (table: string, item: Record<string, unknown>) {
    const values = Object.values(item).map(value => `'${value}'`)
    const valuesStr = values.join(', ')
    const sql = `insert into ${table} values (${valuesStr})`
    return sql
  },

  getUpdateSql (
    table: string,
    newItem: Record<string, unknown>,
    oldItem: Record<string, unknown>,
    keys: string[]
  ) {
    const values = Object.keys(newItem).map(key => `\`${key}\` = '${newItem[key]}'`)
    const conditions = keys.map(key => `\`${key}\` = '${oldItem[key]}'`)
    const valuesStr = values.join(', ')
    const conditionsStr = conditions.join(' and ')
    const sql = `update ${table} set ${valuesStr} where ${conditionsStr}`
    return sql
  },

  getDeleteSql (
    table: string,
    item: Record<string, unknown>,
    keys: string[]
  ) {
    const conditions = keys.map(key => `\`${key}\` = '${item[key]}'`)
    const conditionsStr = conditions.join(' and ')
    const sql = `delete from ${table} where ${conditionsStr}`
    return sql
  },

  timeAfterMinutes (time: number[], minutes: number) {
    const hour = time[0]
    const minute = time[1]

    const howManyhours = Math.floor(minutes / 60)
    const howManyMinutes = minutes % 60

    let newHour = hour + howManyhours
    if (newHour > 23) newHour -= 24
    const newMinutes = howManyMinutes

    return [newHour, newMinutes]
  }
}
