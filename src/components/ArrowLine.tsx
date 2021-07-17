import React, { MouseEvent } from 'react'
import { arrowAngleForPoints, pointArrayForArrow } from '../geometry'
import { Arrow, UnfinishedArrow } from '../types'

type Props = {
  arrow: Arrow | UnfinishedArrow
  straight: boolean
  highlighted?: boolean
  onClick?: (event: MouseEvent) => void
  onMouseDown?: (event: MouseEvent) => void
}

export default function ArrowLine({
  arrow,
  straight,
  highlighted = false,
  onClick,
  onMouseDown,
}: Props) {
  const points = pointArrayForArrow(arrow, straight)
  const endPoint = points[points.length - 1]
  const arrowAngle = arrowAngleForPoints(points)
  const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const color = arrow.fromMarker.color

  const hasMouseEvents = onClick !== undefined || onMouseDown !== undefined
  const strokeWidth = highlighted ? 5 : 3
  return (
    <g
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        pointerEvents: hasMouseEvents ? 'auto' : 'none',
        cursor: hasMouseEvents ? 'crosshair' : 'auto',
      }}
    >
      {hasMouseEvents && (
        <polyline
          points={pointsString}
          stroke='white'
          fill='none'
          style={{ mixBlendMode: 'darken' }}
          strokeWidth={strokeWidth * 3}
        />
      )}
      <polyline
        points={pointsString}
        stroke={color}
        fill='none'
        strokeWidth={strokeWidth}
      />

      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI + Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI + Math.PI / 8)}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      )}
      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI - Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI - Math.PI / 8)}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      )}
    </g>
  )
}
