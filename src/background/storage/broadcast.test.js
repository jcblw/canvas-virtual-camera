import { Extension } from '@mujo/utils'
import {
  createBroadcaster,
  onTabRemoved,
  broadcastToTabs,
  removeTab,
  addTab,
  containsTab,
  removeListener,
} from './broadcast'

const { tabs } = Extension

test('createBroadcaster should create a broadcaster interface', () => {
  const connections = ['foo']
  const broadcaster = createBroadcaster(connections)
  expect(tabs.onRemoved.addListener).toBeCalled()
  expect(typeof broadcaster.add).toBe('function')
  expect(typeof broadcaster.remove).toBe('function')
  expect(typeof broadcaster.broadcast).toBe('function')
  expect(typeof broadcaster.remove).toBe('function')
  expect(typeof broadcaster.contains).toBe('function')
  expect(typeof broadcaster.removeListener).toBe('function')
  expect(broadcaster.connections).toEqual(connections)
})

test('onTabRemoved should return a function', () => {
  expect(typeof onTabRemoved([])).toBe('function')
})

test('onTabRemoved should remove tab from connections', () => {
  const connections = ['foo']
  onTabRemoved(connections)('foo')
  expect(connections.includes('foo')).toBe(false)
})

test('onTabRemoved should remove tab from connections', () => {
  const connections = ['foo']
  onTabRemoved(connections)('foo')
  expect(connections.includes('foo')).toBe(false)
})

test('broadcastToTabs should send a message to connections', () => {
  const connections = ['foo', 'bar']
  const message = { event: 'baz' }
  broadcastToTabs(connections, message)
  expect(tabs.sendMessage).toBeCalledTimes(2)
  expect(tabs.sendMessage).toHaveBeenNthCalledWith(1, 'foo', message)
  expect(tabs.sendMessage).toHaveBeenNthCalledWith(2, 'bar', message)
})

test('removeTab should remove tabId from connections', () => {
  const connections = ['foo', 'bar']
  removeTab(connections, { id: 'bar' })
  expect(connections).toEqual(['foo'])
})

test('removeTab should not remove anything if tab is not found', () => {
  const connections = ['foo']
  removeTab(connections, { id: 'bar' })
  expect(connections).toEqual(['foo'])
})

test('addTab should add tabId from connections', () => {
  const connections = ['foo']
  addTab(connections, { id: 'bar' })
  expect(connections).toEqual(['foo', 'bar'])
})

test('addTab should not add a tab if the tab is already present', () => {
  const connections = ['foo']
  addTab(connections, { id: 'foo' })
  expect(connections).toEqual(['foo'])
})

test('containsTab should return true if tab is in connection', () => {
  const connections = ['foo']
  expect(containsTab(connections, 'foo')).toBe(true)
})

test('containsTab should return false if tab is in connection', () => {
  const connections = ['foo']
  expect(containsTab(connections, 'bar')).toBe(false)
})

test('removeListener should return a function', () => {
  expect(typeof removeListener()).toBe('function')
})

test('removeListener should attempt to remove listener', () => {
  const listener = () => {}
  removeListener(listener)()
  expect(tabs.onRemoved.removeListener).toBeCalledWith(listener)
})
