import React, { MouseEvent, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { distanceBetweenPoints } from '../geometry'
import { Arrow, Marker, UnfinishedArrow } from '../types'
import { pointFromEvent } from '../util'

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
  arrows: Arrow[]
  removeArrowsWithMarkerId: (id: string) => void
  removeArrowWithId: (id: string) => void
  currentlyDragging: UnfinishedArrow | null
  showStraightArrows: boolean
  setShowStraightArrows: (showStraightArrows: boolean) => void
  mouseEvents: {
    svg: SvgMouseEvents
    marker: MarkerMouseEvents
    arrow: ArrowMouseEvents
  }
}

export default function useArrows(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
): ReturnType {
  const [dragging, setDragging] = React.useState<UnfinishedArrow | null>(null)
  const [arrows, setArrows] = React.useState<Arrow[]>([])
  const [showStraightArrows, setShowStraightArrows] = React.useState(false)

  const onMouseDown = useCallback(
    (event: MouseEvent, target: Marker | Arrow) => {
      event.preventDefault()
      const currentPoint = pointFromEvent(event, containerRef.current!)
      const marker = 'fromMarker' in target ? target.fromMarker : target
      const arrowDependencies =
        'arrowDependencies' in target
          ? new Set([...target.arrowDependencies, target.id])
          : new Set<string>()
      setDragging({
        fromMarker: marker,
        fromPoint: currentPoint,
        midPoints: [],
        toPoint: currentPoint,
        toMarker: null,
        arrowDependencies,
      })
    },
    [containerRef],
  )

  const onMouseMove = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!dragging) {
        return
      }

      if (marker) {
        event.stopPropagation()
      }

      const markerIsOriginMarker = marker?.id === dragging.fromMarker.id

      const currentPoint = pointFromEvent(event, containerRef.current!)
      const lastPoint =
        dragging.midPoints[dragging.midPoints.length - 1] ?? dragging.fromPoint

      const newMidPoints =
        !showStraightArrows &&
        distanceBetweenPoints(currentPoint, lastPoint) > 3
          ? [...dragging.midPoints, currentPoint]
          : dragging.midPoints

      setDragging({
        ...dragging,
        midPoints: newMidPoints,
        toPoint: currentPoint,
        toMarker: markerIsOriginMarker ? null : marker ?? null,
      })
    },
    [containerRef, dragging, showStraightArrows],
  )

  const onMouseUp = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!dragging) {
        return
      }

      if (!marker || marker.id === dragging.fromMarker.id) {
        setDragging(null)
        return
      }

      const arrow = {
        fromMarker: dragging.fromMarker,
        fromPoint: dragging.fromPoint,
        midPoints: dragging.midPoints,
        toMarker: marker,
        toPoint: pointFromEvent(event, containerRef.current!),
        id: uuid(),
        arrowDependencies: dragging.arrowDependencies,
      }
      setArrows((arrows) => [...arrows, arrow])
      setDragging(null)
    },
    [containerRef, dragging, setDragging],
  )

  const removeArrowsWithMarkerId = useCallback(
    (id: string) => {
      setArrows(
        arrows.filter(
          (arrow) => arrow.fromMarker.id !== id && arrow.toMarker.id !== id,
        ),
      )
    },
    [arrows, setArrows],
  )

  const removeArrowWithId = useCallback(
    (id: string) => {
      setArrows(
        arrows.filter(
          (arrow) => arrow.id !== id && !arrow.arrowDependencies.has(id),
        ),
      )
    },
    [arrows, setArrows],
  )

  return {
    arrows,
    removeArrowsWithMarkerId,
    removeArrowWithId,
    currentlyDragging: dragging,
    showStraightArrows,
    setShowStraightArrows,
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
