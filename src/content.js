import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/core'
import React from 'react'
import ReactDOM from 'react-dom'
import { WaitForCamera } from './components/wait-for-camera'
import { StreamToCanvas } from './components/stream-to-canvas'

const id = 'canvas-camera-extension'
const renderContentApp = () => {
  // React app in content script
  const el = document.createElement('div')
  // ensures we do not collide with other css
  const cache = createCache({ key: id })
  el.id = id

  document.body.appendChild(el)

  // State: needs to have some mutatable state, potentially store in storage.
  // Blob: Toggle on or off blob.
  // Blob Text: Allow for custom text on Blob.
  // Pixelate: Toggle on or off pixelate
  // Pixel size: Change the size of pixels: needs some limits on this.

  // Use cases:
  // Stepping away from computer: Turn on the blob,
  // with message will be right back.
  // Taking another video call: Turn on pixelate.
  // S/O is coming through room. Turn on pixelate.

  // Notes:
  // Store values in ref. This should allow use to
  // inject it into the render loop

  const App = () => (
    <WaitForCamera>
      <StreamToCanvas />
      <CacheProvider value={cache}>hey</CacheProvider>
    </WaitForCamera>
  )

  ReactDOM.render(<App />, el)
}

if (!document.querySelector(`#${id}`)) {
  renderContentApp()
}
