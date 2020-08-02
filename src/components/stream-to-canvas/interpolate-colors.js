const interpolateColor = (color1, color2, factor = 0.5) => {
  const result = color1.slice()
  for (let i = 0; i < 3; i += 1) {
    result[i] = Math.round(
      result[i] + factor * (color2[i] - color1[i])
    )
  }
  return result
}

// My function to interpolate between two colors completely, returning an array
const interpolateColors = (color1, color2, steps) => {
  const stepFactor = 1 / (steps - 1)
  const interpolatedColorArray = []

  for (let i = 0; i < steps; i += 1) {
    interpolatedColorArray.push(
      interpolateColor(color1, color2, stepFactor * i)
    )
  }

  return interpolatedColorArray
}

module.exports = { interpolateColors }
