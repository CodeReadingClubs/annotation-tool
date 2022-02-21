import React from 'react'
import { useDrawingEventHandlers } from '../hooks/useArrowDrawing'
import useCssColor from '../hooks/useCssColor'
import { selectMarker } from '../reducer'
import { useDispatch } from '../store'
import { Marker } from '../types'

type Props = {
  marker: Marker
  selectable: boolean
}

export default function MarkerRect({ marker, selectable }: Props) {
  const color = useCssColor(marker.color)
  const dispatch = useDispatch()
  const { onClick, onMouseMove } = useDrawingEventHandlers()
  const onContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    dispatch(selectMarker(marker))
  }

  return (
    <rect
      x={marker.left}
      y={marker.top}
      width={marker.width}
      height={marker.height}
      fill={color}
      style={{ pointerEvents: selectable ? 'auto' : 'none' }}
      onContextMenu={onContextMenu}
      onClick={(event) => onClick(event, marker)}
      onMouseMove={(event) => onMouseMove(event, marker)}
    ></rect>
  )
}
