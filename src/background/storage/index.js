import EventEmitter from 'eventemitter3'
import indexDB from './index-db'
import { Storage } from './storage'

export const changeEmitter = new EventEmitter()

export const storage = Storage.from({
  version: '1',
  storageInterface: indexDB,
})

export const onGetStorage = async (key, callback) => {
  const value = await storage.get(key)
  return callback({ key, value })
}

export const onSetStorage = async (key, value, callback) => {
  await storage.set(key, value)
  changeEmitter.emit(key, value)
  return callback({ key, value })
}
