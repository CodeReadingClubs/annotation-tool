import React, { MouseEvent, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { distanceBetweenPoints, pointOnLineNearLine } from '../geometry'
import { addArrow } from '../reducer'
import { useDispatch } from '../store'
import { Arrow, Marker, Point, UnfinishedArrow } from '../types'
import { useContainer } from './useContainer'
import { useSettings } from './useSettings'

type SvgMouseEvents = {
  onMouseMove: (event: MouseEvent) => void
  onMouseUp: (event: MouseEvent) => void
}

type MarkerMouseEvents = {
  onMouseDown: (event: MouseEvent, marker: Marker) => void
  onMouseMove: (event: MouseEvent, marker: Marker) => void
  onMouseUp: (event: MouseEvent, marker: Marker) => void
}

type ArrowMouseEvents = {
  onMouseDown: (event: MouseEvent, arrow: Arrow) => void
}

type ReturnType = {
  drag: UnfinishedArrow | null
  mouseEvents: {
    svg: SvgMouseEvents
    marker: MarkerMouseEvents
    arrow: ArrowMouseEvents
  }
}

export default function useArrowDrawing(): ReturnType {
  const { eventCoordinates } = useContainer()
  const [drag, setDrag] = React.useState<UnfinishedArrow | null>(null)
  const { showStraightArrows } = useSettings()
  const dispatch = useDispatch()

  const onMouseDown = useCallback(
    (event: MouseEvent, target: Marker | Arrow) => {
      event.preventDefault()
      const currentPoint = eventCoordinates(event)
      const { fromPoint, fromMarker, dependencies } = dragStartProperties(
        target,
        showStraightArrows,
        currentPoint,
      )
      setDrag({
        fromPoint,
        fromMarker,
        midPoints: [],
        toPoint: currentPoint,
        toMarker: null,
        dependencies,
      })
    },
    [eventCoordinates],
  )

  const onMouseMove = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!drag) {
        return
      }

      if (marker) {
        event.stopPropagation()
      }

      const markerIsOriginMarker = marker?.id === drag.fromMarker

      const currentPoint = eventCoordinates(event)
      const lastPoint =
        drag.midPoints[drag.midPoints.length - 1] ?? drag.fromPoint

      const newMidPoints =
        !showStraightArrows &&
        distanceBetweenPoints(currentPoint, lastPoint) > 10
          ? [...drag.midPoints, currentPoint]
          : drag.midPoints

      setDrag({
        ...drag,
        midPoints: newMidPoints,
        toPoint: currentPoint,
        toMarker: markerIsOriginMarker ? null : marker?.id ?? null,
      })
    },
    [eventCoordinates, drag, showStraightArrows],
  )

  const onMouseUp = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!drag) {
        return
      }

      if (!marker || marker.id === drag.fromMarker) {
        setDrag(null)
        return
      }

      const arrow = {
        fromMarker: drag.fromMarker,
        fromPoint: drag.fromPoint,
        midPoints: drag.midPoints,
        toMarker: marker.id,
        toPoint: eventCoordinates(event),
        id: uuid(),
        dependencies: { ...drag.dependencies, [marker.id]: true },
      }
      dispatch(addArrow(arrow))
      setDrag(null)
    },
    [eventCoordinates, drag, setDrag],
  )

  return {
    drag,
    mouseEvents: {
      svg: {
        onMouseMove: (e) => onMouseMove(e),
        onMouseUp: (e) => onMouseUp(e),
      },
      marker: {
        onMouseDown: (e, marker) => onMouseDown(e, marker),
        onMouseMove: (e, marker) => onMouseMove(e, marker),
        onMouseUp: (e, marker) => onMouseUp(e, marker),
      },
      arrow: {
        onMouseDown: (e, arrow) => onMouseDown(e, arrow),
      },
    },
  }
}

function dragStartProperties(
  target: Arrow | Marker,
  straight: boolean,
  currentPoint: Point,
): Pick<UnfinishedArrow, 'fromPoint' | 'fromMarker' | 'dependencies'> {
  if ('fromMarker' in target) {
    return {
      fromPoint: straight
        ? pointOnLineNearLine(target.fromPoint, target.toPoint, currentPoint)
        : currentPoint,
      fromMarker: target.fromMarker,
      dependencies: {
        ...target.dependencies,
        [target.id]: true,
        [target.fromMarker]: true,
      },
    }
  } else {
    return {
      fromPoint: currentPoint,
      fromMarker: target.id,
      dependencies: { [target.id]: true },
    }
  }
}
