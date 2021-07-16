import React, { MouseEvent, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { distanceBetweenPoints } from '../geometry'
import { Line, Marker, UnfinishedLine } from '../types'
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

type LineMouseEvents = {
  onMouseDown: (event: MouseEvent, line: Line) => void
}

type ReturnType = {
  lines: Line[]
  removeLinesWithMarkerId: (id: string) => void
  removeLineWithId: (id: string) => void
  currentlyDragging: UnfinishedLine | null
  showStraightLines: boolean
  setShowStraightLines: (showStraightLines: boolean) => void
  mouseEvents: {
    svg: SvgMouseEvents
    marker: MarkerMouseEvents
    line: LineMouseEvents
  }
}

export default function useLines(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
): ReturnType {
  const [dragging, setDragging] = React.useState<UnfinishedLine | null>(null)
  const [lines, setLines] = React.useState<Line[]>([])
  const [showStraightLines, setShowStraightLines] = React.useState(true)

  const onMouseDown = useCallback(
    (event: MouseEvent, target: Marker | Line) => {
      event.preventDefault()
      const currentPoint = pointFromEvent(event, containerRef.current!)
      const marker = 'fromMarker' in target ? target.fromMarker : target
      setDragging({
        fromMarker: marker,
        fromPoint: currentPoint,
        midPoints: [],
        toPoint: currentPoint,
        toMarker: null,
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
        !showStraightLines && distanceBetweenPoints(currentPoint, lastPoint) > 3
          ? [...dragging.midPoints, currentPoint]
          : dragging.midPoints

      setDragging({
        ...dragging,
        midPoints: newMidPoints,
        toPoint: currentPoint,
        toMarker: markerIsOriginMarker ? null : marker ?? null,
      })
    },
    [containerRef, dragging, showStraightLines],
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

      const line = {
        fromMarker: dragging.fromMarker,
        fromPoint: dragging.fromPoint,
        midPoints: dragging.midPoints,
        toMarker: marker,
        toPoint: pointFromEvent(event, containerRef.current!),
        id: uuid(),
      }
      setLines((lines) => [...lines, line])
      setDragging(null)
    },
    [containerRef, dragging, setDragging],
  )

  const removeLinesWithMarkerId = useCallback(
    (id: string) => {
      setLines(
        lines.filter(
          (line) => line.fromMarker.id !== id && line.toMarker.id !== id,
        ),
      )
    },
    [lines, setLines],
  )

  const removeLineWithId = useCallback(
    (id: string) => {
      setLines(lines.filter((line) => line.id !== id))
    },
    [lines, setLines],
  )

  return {
    lines,
    removeLinesWithMarkerId,
    removeLineWithId,
    currentlyDragging: dragging,
    showStraightLines,
    setShowStraightLines,
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
      line: {
        onMouseDown: (e, line) => onMouseDown(e, line),
      },
    },
  }
}
