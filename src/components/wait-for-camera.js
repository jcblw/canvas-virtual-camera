import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
} from 'react'
import { context } from '../canvas-refs'

const VideoID = '#canvas-camera-video'
const CanvasID = '#canvas-camera'
const MutationConfig = {
  attributes: false,
  childList: true,
  subtree: false,
}

export const WaitForCamera = ({ children }) => {
  const [isAttached, setAttached] = useState(false)
  const video = useRef()
  const canvas = useRef()

  const callback = useCallback(() => {
    if (document.querySelector(VideoID)) {
      setAttached(true)
      video.current = document.querySelector(VideoID)
      canvas.current = document.querySelector(CanvasID)
    }
  }, [])

  useEffect(() => {
    callback()
    let observer
    if (!isAttached) {
      observer = new MutationObserver(callback)
      observer.observe(document.body, MutationConfig)
    }
    return () => observer && observer.disconnect()
  }, [callback, isAttached])

  return isAttached ? (
    <context.Provider value={{ video, canvas }}>
      {children}
    </context.Provider>
  ) : null
}
