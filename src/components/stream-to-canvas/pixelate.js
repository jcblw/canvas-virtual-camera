// import { interpolateColors } from './interpolate-colors'

const pixelSize = 25

export const pixelate = (context, width, height) => {
  const pixels = []
  const halfPixel = pixelSize / 2

  for (let r = 0; r < height; r += pixelSize) {
    for (let c = 0; c < width; c += pixelSize) {
      const x = c
      const y = r

      const imageData = context.getImageData(x, y, 1, 1)
      const { data } = imageData

      const red = data[0]
      const green = data[1]
      const blue = data[2]
      const rgb = [red, green, blue]

      // This creates circle pixels
      pixels.push([x, y, rgb])
    }
  }
  context.clearRect(0, 0, width, height)
  context.beginPath()
  context.fillStyle = 'rgb(50,76,47)'
  context.fillRect(0, 0, width, height)
  context.closePath()
  pixels.forEach(([x, y, rgb]) => {
    context.beginPath()
    context.fillStyle = `rgb(${rgb.join(',')})`
    context.arc(x, y, halfPixel - halfPixel / 10, 0, 2 * Math.PI)
    context.fill()
  })
}
