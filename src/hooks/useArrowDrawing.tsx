import React, { MouseEvent, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { distanceBetweenPoints, pointOnPolylineNearPoint } from '../geometry'
import { addArrow } from '../reducer'
import { useDispatch } from '../store'
import { Arrow, Marker, Point, UnfinishedArrow } from '../types'
import { useContainer } from './useContainer'
import useKeyboardHandler from './useKeyboardHandler'
import { useSettings } from './useSettings'

// TYPES

export type EventHandlers = {
  svgMouseEvents: SvgMouseEventHandlers
  markerMouseEvents: MarkerMouseEventHandlers
  arrowMouseEvents: ArrowMouseEventHandlers
}

type SvgMouseEventHandlers = {
  onMouseMove: (event: MouseEvent) => void
  onMouseUp: (event: MouseEvent) => void
}

type MarkerMouseEventHandlers = {
  onMouseDown: (event: MouseEvent, marker: Marker) => void
  onMouseMove: (event: MouseEvent, marker: Marker) => void
  onMouseUp: (event: MouseEvent, marker: Marker) => void
}

type ArrowMouseEventHandlers = {
  onMouseDown: (event: MouseEvent, arrow: Arrow) => void
}

// CONTEXTS

const CurrentArrowContext = React.createContext<
  UnfinishedArrow | null | undefined
>(undefined)
CurrentArrowContext.displayName = 'CurrentArrowContext'

const EventHandlersContext = React.createContext<EventHandlers | undefined>(
  undefined,
)
EventHandlersContext.displayName = 'EventHandlersContext'

// PROVIDER

export function ArrowDrawingProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const { eventCoordinates } = useContainer()
  const [currentArrow, setCurrentArrow] =
    React.useState<UnfinishedArrow | null>(null)
  const { showStraightArrows } = useSettings()
  const dispatch = useDispatch()

  const escapeKeyHandler = React.useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setCurrentArrow(null)
    }
  }, [])
  useKeyboardHandler(escapeKeyHandler)

  const onMouseDown = useCallback(
    (event: MouseEvent, target: Marker | Arrow) => {
      event.preventDefault()
      const currentPoint = eventCoordinates(event)
      const { fromPoint, fromMarker, dependencies } = dragStartProperties(
        target,
        showStraightArrows,
        currentPoint,
      )
      setCurrentArrow({
        fromPoint,
        fromMarker,
        midPoints: [],
        toPoint: currentPoint,
        toMarker: null,
        dependencies,
      })
    },
    [eventCoordinates, showStraightArrows],
  )

  const onMouseMove = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!currentArrow) {
        return
      }

      if (marker) {
        event.stopPropagation()
      }

      const markerIsOriginMarker = marker?.id === currentArrow.fromMarker

      const currentPoint = eventCoordinates(event)
      const lastPoint =
        currentArrow.midPoints[currentArrow.midPoints.length - 1] ??
        currentArrow.fromPoint

      const newMidPoints =
        !showStraightArrows &&
        distanceBetweenPoints(currentPoint, lastPoint) > 10
          ? [...currentArrow.midPoints, currentPoint]
          : currentArrow.midPoints

      setCurrentArrow({
        ...currentArrow,
        midPoints: newMidPoints,
        toPoint: currentPoint,
        toMarker: markerIsOriginMarker ? null : marker?.id ?? null,
      })
    },
    [eventCoordinates, currentArrow, showStraightArrows],
  )

  const onMouseUp = useCallback(
    (event: MouseEvent, marker: Marker | null = null) => {
      if (!currentArrow) {
        return
      }

      if (!marker || marker.id === currentArrow.fromMarker) {
        setCurrentArrow(null)
        return
      }

      const arrow = {
        fromMarker: currentArrow.fromMarker,
        fromPoint: currentArrow.fromPoint,
        midPoints: currentArrow.midPoints,
        toMarker: marker.id,
        toPoint: eventCoordinates(event),
        id: uuid(),
        dependencies: { ...currentArrow.dependencies, [marker.id]: true },
      }
      dispatch(addArrow(arrow))
      setCurrentArrow(null)
    },
    [eventCoordinates, currentArrow],
  )

  const handlers: EventHandlers = {
    svgMouseEvents: {
      onMouseMove: (event) => onMouseMove(event),
      onMouseUp: (event) => onMouseUp(event),
    },
    markerMouseEvents: {
      onMouseDown: (event, marker) => onMouseDown(event, marker),
      onMouseMove: (event, marker) => onMouseMove(event, marker),
      onMouseUp: (event, marker) => onMouseUp(event, marker),
    },
    arrowMouseEvents: {
      onMouseDown: (event, arrow: Arrow) => onMouseDown(event, arrow),
    },
  }

  return (
    <CurrentArrowContext.Provider value={currentArrow}>
      <EventHandlersContext.Provider value={handlers}>
        {children}
      </EventHandlersContext.Provider>
    </CurrentArrowContext.Provider>
  )
}

// HOOKS

export function useArrowDrawingEventHandlers(): EventHandlers {
  const handlers = React.useContext(EventHandlersContext)
  if (!handlers) {
    throw new Error(
      `Tried to call useArrowDrawingEventHandlers outside of an <ArrowDrawingProvider>`,
    )
  }

  return handlers
}

export function useCurrentArrowDrawing(): UnfinishedArrow | null {
  const currentArrow = React.useContext(CurrentArrowContext)
  if (currentArrow === undefined) {
    throw new Error(
      `Tried to call useCurrentArrowDrawing outside of an <ArrowDrawingProvider>`,
    )
  }

  return currentArrow
}

// UTILITIES

function dragStartProperties(
  target: Arrow | Marker,
  showStraightArrows: boolean,
  currentPoint: Point,
): Pick<UnfinishedArrow, 'fromPoint' | 'fromMarker' | 'dependencies'> {
  if ('fromMarker' in target) {
    return {
      fromPoint: pointOnPolylineNearPoint(currentPoint, [
        target.fromPoint,
        ...target.midPoints,
        target.toPoint,
      ]),
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
