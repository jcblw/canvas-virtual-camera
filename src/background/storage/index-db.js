import { Util } from '@mujo/utils'
import { openDB } from 'idb'
import {
  DATABASE_NAME,
  DATABASE_VERSION,
  DATABASE_STORE,
  VALUE_CHANGED,
} from '../../constants'
import { broadcaster } from './broadcast'
import { migrate } from './migrations'
import { types } from './types'

const { set } = Util

export const open = async () =>
  openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade: async (db, lastVersion, currentVersion, transaction) => {
      // migrations - not ran in test unless directly
      if (process.env.NODE_ENV !== 'test') {
        await migrate(lastVersion, currentVersion, transaction)
      }
    },
  })

export const database = open()

export const createMethods = (db, store) => ({
  async get(key) {
    return (await db).get(store, key)
  },
  async set(key, value) {
    const ret = await (await db).put(store, value, key)
    broadcaster.broadcast({ key, value, event: VALUE_CHANGED })
    return ret
  },
  async delete(key) {
    return (await db).delete(store, key)
  },
  async clear() {
    return (await db).clear(store)
  },
  async keys() {
    return (await db).getAllKeys(store)
  },
})

export const store = createMethods(database, DATABASE_STORE)

export default {
  getters: types.reduce((accum, type) => {
    set(accum, type, store.get)
    return accum
  }, {}),
  setters: types.reduce((accum, type) => {
    set(accum, type, store.set)
    return accum
  }, {}),
}
