import { Arrow, Marker, Point, Rect, UnfinishedArrow } from './types'
import { findLast, isMonotonous, minBy, range } from './util'

export function distanceBetweenPoints(a: Point, b: Point): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

export function pointArrayForArrow(
  arrow: Arrow | UnfinishedArrow,
  toMarker: Marker | null,
): Point[] {
  const allPoints = [arrow.fromPoint, ...arrow.midPoints, arrow.toPoint]

  if (!toMarker || allPoints.every((pt) => !isPointInRect(pt, toMarker))) {
    return allPoints
  }

  const lastIndex = findLast(
    allPoints,
    (_, index) =>
      index > 0 &&
      lineRectIntersection(allPoints[index - 1], allPoints[index], toMarker) !==
        null,
  )?.[1]

  if (lastIndex === undefined) {
    throw new Error(`Can't find the intersection of a line with a marker`)
  }

  const intersection = lineRectIntersection(
    allPoints[lastIndex],
    allPoints[lastIndex - 1],
    toMarker,
  )!
  return [...allPoints.slice(0, lastIndex), intersection]
}

export function arrowAngleForPoints(points: Point[]): number | null {
  const n = points.length
  if (distanceBetweenPoints(points[0], points[n - 1]) < 40) {
    return null
  }

  const lastPoint = points[n - 1]
  const secondToLastPoint = findLast(
    points,
    (pt) => distanceBetweenPoints(pt, lastPoint) > 5,
  )
  if (!secondToLastPoint) {
    return null
  }

  return Math.atan2(
    lastPoint.y - secondToLastPoint[0].y,
    lastPoint.x - secondToLastPoint[0].x,
  )
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

  return firstIntersection[0][1]
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

export function pointOnPolylineNearPoint(p: Point, polyline: Point[]): Point {
  const pointsOnSegments = pairs(polyline).map((segment) =>
    pointOnLineNearPoint(...segment, p),
  )

  const pointOnNearestSegment = minBy(pointsOnSegments, (pt) =>
    distanceBetweenPoints(p, pt),
  )
  if (!pointOnNearestSegment) {
    throw new Error(`Not enough points on polyline`)
  }

  return pointOnNearestSegment[0]
}

function pairs<T>(array: T[]): [T, T][] {
  return range(0, array.length - 1).map((index) => [
    array[index],
    array[index + 1],
  ])
}

function pointOnLineNearPoint(
  p1: Point,
  p2: Point,
  { x: x0, y: y0 }: Point,
): Point {
  const d = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  const n = { x: (p2.x - p1.x) / d, y: (p2.y - p1.y) / d }
  const t0 = (x0 - p1.x) * n.x + (y0 - p1.y) * n.y
  if (t0 <= 0) {
    return p1
  } else if (t0 >= d) {
    return p2
  }

  return { x: p1.x + t0 * n.x, y: p1.y + t0 * n.y }
}

export function isPointInRect(
  { x, y }: Point,
  { top, bottom, left, right }: Rect,
): boolean {
  return isMonotonous(left, x, right) && isMonotonous(top, y, bottom)
}
