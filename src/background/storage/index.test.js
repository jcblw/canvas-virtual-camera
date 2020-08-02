import { ALARM_KEY, DATABASE_STORE } from '../../constants'
import { open, createMethods } from './index-db'
import { onGetStorage, onSetStorage } from '.'

let db
let store

beforeAll(async () => {
  db = await open()
  store = createMethods(db, DATABASE_STORE)
})

test('onGetStorage should get data from indexDB', async () => {
  expect.assertions(2)
  await store.set(ALARM_KEY, true)
  await onGetStorage(ALARM_KEY, ({ key, value }) => {
    expect(key).toBe(ALARM_KEY)
    expect(value).toBe(true)
  })
})

test('onSetStorage should set data in indexDB', async () => {
  expect.assertions(3)
  await store.set(ALARM_KEY, false)
  await onSetStorage(ALARM_KEY, true, async ({ key, value }) => {
    expect(key).toBe(ALARM_KEY)
    expect(value).toBe(true)
    const alarmKey = await store.get(ALARM_KEY)
    expect(alarmKey).toBe(true)
  })
})
