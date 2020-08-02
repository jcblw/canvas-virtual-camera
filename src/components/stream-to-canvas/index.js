import { useRef, useEffect, useCallback } from 'react'
import { useCanvas } from '../../hooks/use-canvas'
import { drawBlob } from './blob'
import { pixelate } from './pixelate'

export const StreamToCanvas = () => {
  const { canvas, video } = useCanvas()
  const req = useRef()
  const meta = useRef()

  const loop = useCallback(() => {
    const ctx = canvas.current.getContext('2d')
    const { width, height } = canvas.current
    ctx.drawImage(video.current, 0, 0, width, height)
    pixelate(ctx, width, height)
    drawBlob({ ctx, meta, x: 110, y: 110 })

    req.current = requestAnimationFrame(loop)
  }, [canvas, video])

  useEffect(() => {
    meta.current = 0
    loop()
    return () => cancelAnimationFrame(req.current)
  }, [loop])

  return null
}
