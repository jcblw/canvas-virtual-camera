export const normalize = (n, start1, stop1, start2, stop2) =>
  ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2

export const distance = ([x, y], [x1, y1]) =>
  Math.hypot(x - x1, y - y1)

export const angleToRadian = x => x * 0.0174533

export const randianBetweenPoints = (p1, p2) =>
  Math.atan2(p2[1] - p1[1], p2[0] - p1[0])

export const getPointOnCircle = (cx, cy, radian, radius) => [
  cx + radius * Math.cos(radian),
  cy + radius * Math.sin(radian),
]
