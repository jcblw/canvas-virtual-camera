import { Extension } from '@mujo/utils'
import { reducer } from './background/message-reducer'
import { injectScript } from './background/inject'

const { onMessage, webNavigation } = Extension

webNavigation.onCommitted.addListener(injectScript)

onMessage(reducer)
