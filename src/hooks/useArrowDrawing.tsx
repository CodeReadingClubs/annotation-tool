import React, { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { distanceBetweenPoints, pointOnPolylineNearPoint } from '../geometry'
import { addArrow } from '../reducer'
import { useDispatch } from '../store'
import { Arrow, Marker, Point, UnfinishedArrow } from '../types'
import { useContainer } from './useContainer'
import useKeyboardHandler from './useKeyboardHandler'
import { useSettings } from './useSettings'

// TYPES

type EventHandlers = {
  onClick: (event: React.MouseEvent, target: Marker | Arrow | null) => void
  onMouseMove: (event: React.MouseEvent, target: Marker | null) => void
  cancelArrow: () => void
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

  const onClick = useCallback(
    (event: React.MouseEvent, target: Marker | Arrow | null) => {
      if (event.button === 2) {
        return
      }
      event.stopPropagation()
      const currentPoint = eventCoordinates(event)
      if (!currentArrow) {
        if (target) {
          setCurrentArrow(newArrow(target, showStraightArrows, currentPoint))
        }
      } else if (targetIsOrigin(target, currentArrow)) {
        setCurrentArrow(null)
      } else if (isMarker(target)) {
        dispatch(addArrow(finishedArrow(currentPoint, target, currentArrow)))
        setCurrentArrow(null)
      } else {
        setCurrentArrow({
          ...currentArrow,
          midPoints: [...currentArrow.midPoints, currentPoint],
        })
      }
    },
    [eventCoordinates, currentArrow, showStraightArrows],
  )

  const onMouseMove = useCallback(
    (event: React.MouseEvent, target: Marker | null) => {
      if (!currentArrow) {
        return
      }
      event.stopPropagation()
      const currentPoint = eventCoordinates(event)

      const addCurrentPointAsMidPoint =
        currentArrow.drawingMode === 'freehand' &&
        shouldAddCurrentPointToFreehandArrow(currentPoint, currentArrow)
      const midPoints = addCurrentPointAsMidPoint
        ? [...currentArrow.midPoints, currentPoint]
        : currentArrow.midPoints
      const toMarker = targetIsOrigin(target, currentArrow)
        ? null
        : target?.id ?? null

      setCurrentArrow({
        ...currentArrow,
        midPoints,
        toPoint: currentPoint,
        toMarker,
      })
    },
    [currentArrow, eventCoordinates],
  )

  const cancelArrow = React.useCallback(() => {
    setCurrentArrow(null)
  }, [])

  const handlers: EventHandlers = React.useMemo(
    () => ({
      onClick,
      onMouseMove,
      cancelArrow,
    }),
    [onClick, onMouseMove, cancelArrow],
  )

  return (
    <CurrentArrowContext.Provider value={currentArrow}>
      <EventHandlersContext.Provider value={handlers}>
        {children}
      </EventHandlersContext.Provider>
    </CurrentArrowContext.Provider>
  )
}

// HOOKS

export function useDrawingEventHandlers(): EventHandlers {
  const handlers = React.useContext(EventHandlersContext)
  if (!handlers) {
    throw new Error(
      `Tried to call useDrawingEventHandlers outside of an <ArrowDrawingProvider>`,
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

function newArrow(
  target: Arrow | Marker,
  showStraightArrows: boolean,
  currentPoint: Point,
): UnfinishedArrow {
  const drawingMode = showStraightArrows ? 'jointed' : 'freehand'
  if (isArrow(target)) {
    const fromPoint = pointOnPolylineNearPoint(currentPoint, [
      target.fromPoint,
      ...target.midPoints,
      target.toPoint,
    ])
    const dependencies = {
      ...target.dependencies,
      [target.id]: true,
      [target.fromMarker]: true,
    }
    return {
      drawingMode,
      fromPoint,
      fromMarker: target.fromMarker,
      fromArrow: target.id,
      midPoints: [],
      toPoint: currentPoint,
      toMarker: null,
      dependencies,
    }
  } else {
    return {
      drawingMode,
      fromPoint: currentPoint,
      fromMarker: target.id,
      fromArrow: null,
      midPoints: [],
      toPoint: currentPoint,
      toMarker: null,
      dependencies: { [target.id]: true },
    }
  }
}

function finishedArrow(
  currentPoint: Point,
  target: Marker,
  currentArrow: UnfinishedArrow,
): Arrow {
  return {
    fromMarker: currentArrow.fromMarker,
    fromPoint: currentArrow.fromPoint,
    midPoints: currentArrow.midPoints,
    toMarker: target.id,
    toPoint: currentPoint,
    id: uuid(),
    dependencies: { ...currentArrow.dependencies, [target.id]: true },
  }
}

function shouldAddCurrentPointToFreehandArrow(
  currentPoint: Point,
  currentArrow: UnfinishedArrow,
) {
  const lastPoint =
    currentArrow.midPoints[currentArrow.midPoints.length - 1] ??
    currentArrow.fromPoint
  return distanceBetweenPoints(currentPoint, lastPoint) > 10
}

function isArrow(target: Arrow | Marker | null): target is Arrow {
  return target !== null && 'fromMarker' in target
}

function isMarker(target: Arrow | Marker | null): target is Marker {
  return target !== null && !('fromMarker' in target)
}

function targetIsOrigin(
  target: Marker | Arrow | null,
  currentArrow: UnfinishedArrow,
): boolean {
  if (!target) {
    return false
  }
  return (
    target.id === currentArrow.fromArrow ||
    target.id === currentArrow.fromMarker
  )
}
