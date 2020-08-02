import EventEmitter from 'eventemitter3'
import {
  GET_STORAGE,
  SET_STORAGE,
  ADD_BROADCAST_TAB,
  REMOVE_BROADCAST_TAB,
} from '../constants'
import { onGetStorage, onSetStorage } from './storage'
import { broadcaster } from './storage/broadcast'

export const messageEmitter = new EventEmitter()

export const reducer = (request, sender, sendResponse) => {
  const { event } = request
  let hasResponse = false
  switch (event) {
    case ADD_BROADCAST_TAB:
      broadcaster.add(sender.tab)
      break
    case REMOVE_BROADCAST_TAB:
      broadcaster.remove(sender.tab)
      break
    case GET_STORAGE:
      hasResponse = true
      onGetStorage(request.key, sendResponse)
      break
    case SET_STORAGE:
      hasResponse = true
      onSetStorage(request.key, request.value, sendResponse)
      break
    default:
  }
  if (!hasResponse) {
    sendResponse({ success: true })
  }
  return true // must return true if there is a reponse
}
