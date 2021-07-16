import { Point, Rect } from './types'
import { isMonotonous, minBy } from './util'

export function distanceBetweenPoints(a: Point, b: Point): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export function lineRectIntersection(
  p1: Point,
  p2: Point,
  rect: Rect,
): Point | null {
  const intersections = [
    horizontalLineIntersection(p1, p2, rect.left, rect.right, rect.top),
    horizontalLineIntersection(p1, p2, rect.left, rect.right, rect.bottom),
    verticalLineIntersection(p1, p2, rect.left, rect.top, rect.bottom),
    verticalLineIntersection(p1, p2, rect.right, rect.top, rect.bottom),
  ].filter(
    (intersection): intersection is [number, Point] => intersection !== null,
  )

  const firstIntersection = minBy(intersections, ([t]) => t)
  if (!firstIntersection) {
    return null
  }

  return firstIntersection[1]
}

function horizontalLineIntersection(
  p1: Point,
  p2: Point,
  x1: number,
  x2: number,
  y: number,
): [number, Point] | null {
  if (p1.y === p2.y) {
    return null
  }

  const t = (y - p1.y) / (p2.y - p1.y)
  const x = p1.x + t * (p2.x - p1.x)

  if (isMonotonous(0, t, 1) && isMonotonous(x1, x, x2)) {
    return [t, { x, y }]
  } else {
    return null
  }
}

function verticalLineIntersection(
  p1: Point,
  p2: Point,
  x: number,
  y1: number,
  y2: number,
): [number, Point] | null {
  if (p1.x === p2.x) {
    return null
  }

  const t = (x - p1.x) / (p2.x - p1.x)
  const y = p1.y + t * (p2.y - p1.y)

  if (isMonotonous(0, t, 1) && isMonotonous(y1, y, y2)) {
    return [t, { x, y }]
  } else {
    return null
  }
}
