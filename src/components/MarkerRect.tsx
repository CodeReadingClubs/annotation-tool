import React, { MouseEvent } from 'react'
import useCssColor from '../hooks/useCssColor'
import { Marker } from '../types'

type Props = {
  marker: Marker
  selectable: boolean
  onClick: () => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
}

export default function MarkerRect({
  marker,
  selectable,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: Props) {
  const color = useCssColor(marker.color)

  return (
    <rect
      x={marker.left}
      y={marker.top}
      width={marker.width}
      height={marker.height}
      fill={color}
      style={{ pointerEvents: selectable ? 'auto' : 'none' }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    ></rect>
  )
}
