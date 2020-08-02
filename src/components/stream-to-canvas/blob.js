import SimplexNoise from 'simplex-noise'
import { getPointOnCircle, normalize, angleToRadian } from './math'

const noisePoint = [rando(), rando()]
const simplex = new SimplexNoise()

export const drawBlob = ({
  scale = 1,
  x = 0,
  x2,
  y = 0,
  lr = 10,
  ur = 20,
  color = 'white',
  radius = 100,
  animated = true,
  angles = 50,
  ctx,
  meta,
}) => {
  const arr = []
  const center = [x, y]
  const noiseCenter = getPointOnCircle(
    ...noisePoint,
    angleToRadian(meta.current),
    10
  )
  for (
    let angle = 0;
    angle <= Math.PI * 2;
    angle += Math.PI / angles
  ) {
    const perlinPoint = getPointOnCircle(...noiseCenter, angle, 0.5)
    const off = normalize(
      simplex.noise2D(...perlinPoint),
      0,
      1,
      lr,
      ur
    )

    const radi = radius * scale + off
    const px = radi * Math.cos(angle) + center[0]
    const py = radi * Math.sin(angle) + center[1]
    arr.push([px, py])
  }

  let started = false
  ctx.beginPath()
  ctx.fillStyle = color
  arr.forEach(([px, py], ii) => {
    if (started) {
      ctx.lineTo(px, py)
    } else {
      ctx.moveTo(px, py)
      started = true
    }
  })
  ctx.closePath()
  ctx.fill()

  if (animated) {
    /* eslint-disable-next-line */
    meta.current += 0.05
  }
}

function rando() {
  return Math.floor(Math.random() * 100)
}
