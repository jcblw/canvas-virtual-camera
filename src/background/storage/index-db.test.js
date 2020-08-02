import {
  LAST_ACTIVITY_TABLE,
  ACTIVITY_NUMBER_KEY,
} from '../../constants'
import * as IndexDBInterface from './index-db'
import { types } from './types'

const {
  default: indexDBInterface,
  open,
  database,
  addLatestActivity,
  store,
} = IndexDBInterface

test('open should return a promise', () => {
  expect(typeof open().then).toBe('function')
})

test('database to be a promise', () => {
  expect(typeof database.then).toBe('function')
})

test('addLatestActivity should add an entry to indexDB', async () => {
  const db = await database
  const date = new Date()
  await store.set(ACTIVITY_NUMBER_KEY, 1)
  const added = await addLatestActivity(date)
  expect(db.get(LAST_ACTIVITY_TABLE, added)).resolves.toEqual({
    date,
    activityNumber: 1,
    id: added,
  })
})

// NOTE: most other functionality of this module is tests like ./types.test.js
test('indexDBInterface should have getters for all types', () => {
  types.forEach(type => {
    expect(typeof indexDBInterface.getters[type]).toBe('function')
  })
})

test('indexDBInterface should have setters for all types', () => {
  types.forEach(type => {
    expect(typeof indexDBInterface.setters[type]).toBe('function')
  })
})
