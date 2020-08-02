// NOTE: array of tab ids
import { Functional, Extension } from '@mujo/utils'

const { tabs } = Extension
const { curry } = Functional

export const containsTab = curry((connections, tabId) =>
  connections.includes(tabId)
)

export const addTab = curry((connections, tab) => {
  const { id } = tab
  const hasTab = containsTab(connections, id)
  if (hasTab) return
  connections.push(id)
})

export const removeTab = curry((connections, tab) => {
  const index = connections.indexOf(tab.id)
  if (index === -1) return
  connections.splice(index, 1)
})

export const broadcastToTabs = curry((connections, message) =>
  connections.forEach(tabId => {
    try {
      tabs.sendMessage(tabId, message)
    } catch (e) {
      // TODO: swap to sentry
      // addData({
      //   event: 'exception',
      //   errorMessage: e.message,
      //   errorStack: e.stack,
      // })
    }
  })
)

export const onTabRemoved = connections => tabId => {
  const hasTab = containsTab(connections, tabId)
  if (hasTab) {
    removeTab(connections, { id: tabId })
  }
}

export const removeListener = listener => () => {
  tabs.onRemoved.removeListener(listener)
}

export const createBroadcaster = connections => {
  const listener = onTabRemoved(connections)
  tabs.onRemoved.addListener(listener)
  return {
    add: addTab(connections),
    remove: removeTab(connections),
    broadcast: broadcastToTabs(connections),
    contains: containsTab(connections),
    removeListener: removeListener(listener),
    connections,
  }
}

export const broadcaster = createBroadcaster([])
