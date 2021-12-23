import React from 'react'
import { useArrowDrawingEventHandlers } from '../hooks/useArrowDrawing'
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
  const { markerMouseEvents } = useArrowDrawingEventHandlers()

  return (
    <rect
      x={marker.left}
      y={marker.top}
      width={marker.width}
      height={marker.height}
      fill={color}
      style={{ pointerEvents: selectable ? 'auto' : 'none' }}
      onClick={() => dispatch(selectMarker(marker))}
      onMouseDown={(event) => markerMouseEvents.onMouseDown(event, marker)}
      onMouseMove={(event) => markerMouseEvents.onMouseMove(event, marker)}
      onMouseUp={(event) => markerMouseEvents.onMouseUp(event, marker)}
    ></rect>
  )
}
