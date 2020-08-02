import { Functional, Util } from '@mujo/utils'

const { identity } = Functional
const { toString } = Util

export const types = ['object', 'string', 'boolean', 'number']

export const serializers = {
  object: x => JSON.stringify(x) || 'null',
  string: identity,
  boolean: toString,
  number: toString,
}

export const deserializers = {
  object: x => {
    let ret
    try {
      ret = JSON.parse(x)
    } catch (e) {
      ret = null
    }
    return ret
  },
  string: identity,
  boolean: x => x === 'true',
  number: x => parseInt(x, 10),
}
