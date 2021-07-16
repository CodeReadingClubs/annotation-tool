import React from 'react'
import { distanceBetweenPoints, lineRectIntersection, Point } from './geometry'
import { Line, UnfinishedLine } from './useLines'
import { findLast } from './util'

type Props = {
  line: Line | UnfinishedLine
  straight: boolean
}

export default function Arrow({ line, straight }: Props) {
  const points = pointArrayForLine(line, straight)
  const endPoint = points[points.length - 1]
  const arrowAngle = arrowAngleForPoints(points)
  const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const color = line.fromMarker.color

  return (
    <g>
      <polyline
        points={pointsString}
        stroke={color}
        fill='none'
        strokeWidth='3'
      />
      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI + Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI + Math.PI / 8)}
          stroke={color}
          strokeWidth='3'
        />
      )}
      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI - Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI - Math.PI / 8)}
          stroke={color}
          strokeWidth='3'
        />
      )}
    </g>
  )
}
function arrowAngleForPoints(points: Point[]): number | null {
  const n = points.length
  if (distanceBetweenPoints(points[0], points[n - 1]) < 40) {
    return null
  }

  const lastPoint = points[n - 1]
  const secondToLastPoint = findLast(
    points,
    (pt) => distanceBetweenPoints(pt, lastPoint) > 4,
  )
  if (!secondToLastPoint) {
    return null
  }

  return Math.atan2(
    lastPoint.y - secondToLastPoint[0].y,
    lastPoint.x - secondToLastPoint[0].x,
  )
}
function pointArrayForLine(
  line: Line | UnfinishedLine,
  straight: boolean,
): Point[] {
  const allPoints = straight
    ? [line.fromPoint, line.toPoint]
    : [line.fromPoint, ...line.midPoints, line.toPoint]

  const marker = line.toMarker
  if (!marker) {
    return allPoints
  }

  const lastIndex = findLast(
    allPoints,
    (_, index) =>
      index > 0 &&
      lineRectIntersection(allPoints[index - 1], allPoints[index], marker) !==
        null,
  )?.[1]

  if (lastIndex === undefined) {
    throw new Error(`Can't find the intersection of a line with a marker`)
  }

  const intersection = lineRectIntersection(
    allPoints[lastIndex],
    allPoints[lastIndex - 1],
    marker,
  )!
  return [...allPoints.slice(0, lastIndex), intersection]
}
