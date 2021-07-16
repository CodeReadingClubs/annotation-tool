import React, { MouseEvent } from 'react'
import { Marker } from '../types'

type Props = {
  marker: Marker
  onClick: () => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
}

export default function MarkerRect({
  marker,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: Props) {
  return (
    <rect
      x={marker.left}
      y={marker.top}
      width={marker.width}
      height={marker.height}
      fill={marker.color}
      style={{ pointerEvents: 'auto' }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    ></rect>
  )
}
