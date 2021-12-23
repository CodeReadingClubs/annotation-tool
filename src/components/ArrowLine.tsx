import React, { MouseEvent } from 'react'
import { arrowAngleForPoints, pointArrayForArrow } from '../geometry'
import useCssColor from '../hooks/useCssColor'
import { useSelector } from '../store'
import { Arrow, UnfinishedArrow } from '../types'

type Props = {
  arrow: Arrow | UnfinishedArrow
  highlighted?: boolean
  selectable: boolean
  onClick?: (event: MouseEvent) => void
  onMouseDown?: (event: MouseEvent) => void
}

export default function ArrowLine({
  arrow,
  highlighted = false,
  selectable,
  onClick,
  onMouseDown,
}: Props) {
  const toMarker = useSelector((state) =>
    arrow.toMarker ? state.markers[arrow.toMarker] : null,
  )
  const points = pointArrayForArrow(arrow, toMarker)

  const endPoint = points[points.length - 1]
  const arrowAngle = arrowAngleForPoints(points)
  const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const color = useSelector(
    (state) => arrow.color ?? state.markers[arrow.fromMarker].color,
  )
  const cssColor = useCssColor(color)

  const hasMouseEvents = onClick !== undefined || onMouseDown !== undefined
  const strokeWidth = highlighted ? 5 : 3
  return (
    <g
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        pointerEvents: selectable ? 'auto' : 'none',
        cursor: hasMouseEvents ? 'crosshair' : 'auto',
      }}
    >
      {hasMouseEvents && (
        <polyline
          points={pointsString}
          stroke='white'
          fill='none'
          style={{ mixBlendMode: 'multiply' }}
          strokeWidth={strokeWidth * 3}
        />
      )}
      <polyline
        points={pointsString}
        stroke={cssColor}
        fill='none'
        strokeWidth={strokeWidth}
      />

      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI + Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI + Math.PI / 8)}
          stroke={cssColor}
          strokeWidth={strokeWidth}
        />
      )}
      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI - Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI - Math.PI / 8)}
          stroke={cssColor}
          strokeWidth={strokeWidth}
        />
      )}
    </g>
  )
}
