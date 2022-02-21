import React, { MouseEvent } from 'react'
import { arrowAngleForPoints, pointArrayForArrow } from '../geometry'
import {
  useCurrentArrowDrawing,
  useDrawingEventHandlers,
} from '../hooks/useArrowDrawing'
import { useContainer } from '../hooks/useContainer'
import useCssColor from '../hooks/useCssColor'
import { selectArrow } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { Arrow, UnfinishedArrow } from '../types'

type Props = {
  arrow: Arrow | UnfinishedArrow
  highlighted: boolean
  selectable: boolean
  onContextMenu?: (event: MouseEvent) => void
  onClick?: (event: MouseEvent) => void
}

function ArrowLine({
  arrow,
  highlighted,
  selectable,
  onContextMenu,
  onClick,
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

  const hasMouseEvents = onContextMenu !== undefined || onClick !== undefined
  const strokeWidth = highlighted ? 5 : 3
  return (
    <g
      onContextMenu={onContextMenu}
      onClick={onClick}
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

type FinishedArrowLineProps = {
  arrow: Arrow
  highlighted: boolean
  selectable: boolean
}

export function FinishedArrowLine({
  arrow,
  highlighted,
  selectable,
}: FinishedArrowLineProps) {
  const dispatch = useDispatch()
  const drawing = useDrawingEventHandlers()
  const { eventCoordinates } = useContainer()
  const onContextMenu = React.useCallback(
    (event: MouseEvent) => {
      event.preventDefault()
      dispatch(selectArrow({ arrow, point: eventCoordinates(event) }))
    },
    [eventCoordinates],
  )

  return (
    <ArrowLine
      arrow={arrow}
      selectable={selectable}
      highlighted={highlighted}
      onContextMenu={onContextMenu}
      onClick={(event) => drawing.onClick(event, arrow)}
    />
  )
}

export function UnfinishedArrowLine() {
  const arrow = useCurrentArrowDrawing()
  if (!arrow) {
    return null
  }
  return <ArrowLine arrow={arrow} highlighted={false} selectable={false} />
}
