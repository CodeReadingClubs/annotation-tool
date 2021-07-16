import React, { MouseEvent, PropsWithChildren, useCallback } from 'react'
import { v4 as uuid } from 'uuid'

const code = `
function configFromInput(config) {
    var input = config._i;
    if (isUndefined(input)) {
        config._d = new Date(hooks.now());
    } else if (isDate(input)) {
        config._d = new Date(input.valueOf());
    } else if (typeof input === 'string') {
        configFromString(config);
    } else if (isArray(input)) {
        config._a = map(input.slice(0), function (obj) {
            return parseInt(obj, 10);
        });
        configFromArray(config);
    } else if (isObject(input)) {
        configFromObject(config);
    } else if (isNumber(input)) {
        // from milliseconds
        config._d = new Date(input);
    } else {
        hooks.createFromInputFallback(config);
    }
}
`

type Rect = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

type Selection = Rect & {
  id: string
}

type Marker = Selection & {
  color: string
}

type Point = { x: number; y: number }

type UnfinishedLine = {
  fromPoint: Point
  fromMarker: Marker
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker | null
}

type Line = {
  fromPoint: Point
  fromMarker: Marker
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker
  id: string
}

function App() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [selection, clearSelection] = useSelection(containerRef)
  const [markers, setMarkers] = React.useState<Marker[]>([])
  const {
    lines,
    removeLinesWithMarkerId,
    currentlyDragging,
    showStraightLines,
    setShowStraightLines,
    ...mouseEvents
  } = useLines(containerRef)
  const [selectedMarker, setSelectedMarker] = React.useState<Marker | null>(
    null,
  )

  const addMarker = (selection: Selection, color: string) => {
    setMarkers((markers) => [
      ...markers,
      {
        ...selection,
        color,
      },
    ])
    clearSelection()
  }

  const removeMarker = (marker: Marker) => {
    setMarkers((markers) => markers.filter((m) => m.id !== marker.id))
    removeLinesWithMarkerId(marker.id)
    setSelectedMarker(null)
  }

  return (
    <div>
      <div>
        <input
          type='checkbox'
          id='straight-arrows'
          checked={showStraightLines}
          onChange={(e) => setShowStraightLines(e.target.checked)}
        />
        <label htmlFor='straight-arrows'>Use straight arrows</label>
      </div>
      <div className='container' ref={containerRef}>
        <pre>{code}</pre>
        <svg
          style={{
            pointerEvents: currentlyDragging ? 'auto' : 'none',
          }}
          onMouseMove={(e) => mouseEvents.onMouseMove(e)}
          onMouseUp={(e) => mouseEvents.onMouseUp(e)}
        >
          {currentlyDragging && (
            <Line line={currentlyDragging} straight={showStraightLines} />
          )}
          {lines.map((line) => (
            <Line line={line} straight={showStraightLines} key={line.id} />
          ))}
          {markers.map((marker, index) => (
            <Marker
              marker={marker}
              key={marker.id}
              onClick={() => setSelectedMarker(marker)}
              onMouseDown={(e) => mouseEvents.onMouseDown(e, marker)}
              onMouseMove={(e) => mouseEvents.onMouseMove(e, marker)}
              onMouseUp={(e) => mouseEvents.onMouseUp(e, marker)}
            />
          ))}
        </svg>
        {selectedMarker && (
          <Popover rect={selectedMarker} onBlur={() => setSelectedMarker(null)}>
            <button onClick={() => removeMarker(selectedMarker)}>remove</button>
          </Popover>
        )}
        {selection && (
          <Popover rect={selection}>
            <button onClick={() => addMarker(selection, 'lightblue')}>
              blue
            </button>
            <button onClick={() => addMarker(selection, 'lightgreen')}>
              green
            </button>
            <button onClick={() => addMarker(selection, 'gold')}>yellow</button>
          </Popover>
        )}
      </div>
    </div>
  )
}

export default App

type PopoverProps = PropsWithChildren<{
  rect: Selection | Marker
  onBlur?: () => void
}>

function Popover({ rect, children, onBlur }: PopoverProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (onBlur) {
      ref.current?.focus()
    }
  }, [])

  const centerX = (rect.right + rect.left) / 2
  return (
    <div
      ref={ref}
      onBlur={onBlur}
      tabIndex={1}
      className='popover'
      style={{
        position: 'absolute',
        top: rect.top + rect.height,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        outline: 'none',
      }}
    >
      {children}
    </div>
  )
}

type MarkerProps = {
  marker: Marker
  onClick: () => void
  onMouseDown: (e: MouseEvent) => void
  onMouseMove: (e: MouseEvent) => void
  onMouseUp: (e: MouseEvent) => void
}

function Marker({
  marker,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: MarkerProps) {
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

type LineProps = {
  line: Line | UnfinishedLine
  straight: boolean
}

function Line({ line, straight }: LineProps) {
  const points = pointArrayForLine(line, straight)
  const endPoint = points[points.length - 1]
  const arrowAngle = arrowAngleForPoints(points)
  const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const color = line.fromMarker.color

  return (
    <g>
      <polyline
        points={pointsString}
        stroke={color}
        fill='none'
        strokeWidth='3'
      />
      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI + Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI + Math.PI / 8)}
          stroke={color}
          strokeWidth='3'
        />
      )}
      {arrowAngle && (
        <line
          x1={endPoint.x}
          y1={endPoint.y}
          x2={endPoint.x + 15 * Math.cos(arrowAngle + Math.PI - Math.PI / 8)}
          y2={endPoint.y + 15 * Math.sin(arrowAngle + Math.PI - Math.PI / 8)}
          stroke={color}
          strokeWidth='3'
        />
      )}
    </g>
  )
}

function arrowAngleForPoints(points: Point[]): number | null {
  const n = points.length
  if (distanceBetweenPoints(points[0], points[n - 1]) < 40) {
    return null
  }

  const lastPoint = points[n - 1]
  const secondToLastPoint = findLast(
    points,
    (pt) => distanceBetweenPoints(pt, lastPoint) > 4,
  )
  if (!secondToLastPoint) {
    return null
  }

  return Math.atan2(
    lastPoint.y - secondToLastPoint[0].y,
    lastPoint.x - secondToLastPoint[0].x,
  )
}

function pointArrayForLine(
  line: Line | UnfinishedLine,
  straight: boolean,
): Point[] {
  const allPoints = straight
    ? [line.fromPoint, line.toPoint]
    : [line.fromPoint, ...line.midPoints, line.toPoint]

  const marker = line.toMarker
  if (!marker) {
    return allPoints
  }

  const lastIndex = findLast(
    allPoints,
    (_, index) =>
      index > 0 &&
      lineRectIntersection(allPoints[index - 1], allPoints[index], marker) !==
        null,
  )?.[1]

  if (lastIndex === undefined) {
    throw new Error(`Can't find the intersection of a line with a marker`)
  }

  const intersection = lineRectIntersection(
    allPoints[lastIndex],
    allPoints[lastIndex - 1],
    marker,
  )!
  return [...allPoints.slice(0, lastIndex), intersection]
}

function rangeRect(range: Range): DOMRect {
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0,
  )
  if (rects.length !== 1) {
    throw new Error(`Can't deal with range with ${rects.length} rects`)
  }

  return rects[0]
}

function useSelection(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
): [Selection | null, () => void] {
  const [selection, setSelection] = React.useState<Selection | null>(null)

  React.useEffect(() => {
    document.onselectionchange = () => {
      if (!containerRef.current) {
        throw new Error(`Invalid <pre> ref`)
      }
      const selection = document.getSelection()
      if (
        !selection ||
        selection.type !== 'Range' ||
        selection.toString().includes('\n')
      ) {
        setSelection(null)
      } else {
        const rect = rangeRect(selection.getRangeAt(0))
        const parentRect = containerRef.current.getBoundingClientRect()
        setSelection({
          top: rect.top - parentRect.top,
          left: rect.left - parentRect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom - parentRect.top,
          right: rect.right - parentRect.left,
          id: uuid(),
        })
      }
    }
  }, [])

  const clearSelection = useCallback(() => {
    document.getSelection()?.removeAllRanges()
    setSelection(null)
  }, [])

  return [selection, clearSelection]
}

type UseLinesReturnType = {
  onMouseDown: (event: MouseEvent, marker: Marker) => void
  onMouseMove: (event: MouseEvent, marker?: Marker) => void
  onMouseUp: (event: MouseEvent, marker?: Marker) => void
  lines: Line[]
  removeLinesWithMarkerId: (id: string) => void
  currentlyDragging: UnfinishedLine | null
  showStraightLines: boolean
  setShowStraightLines: (showStraightLines: boolean) => void
}

function useLines(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
): UseLinesReturnType {
  const [dragging, setDragging] = React.useState<UnfinishedLine | null>(null)
  const [lines, setLines] = React.useState<Line[]>([])
  const [showStraightLines, setShowStraightLines] = React.useState(true)

  const onMouseDown = useCallback(
    (event: MouseEvent, marker: Marker) => {
      event.preventDefault()
      const currentPoint = pointFromEvent(event, containerRef.current!)
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

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    lines,
    removeLinesWithMarkerId,
    currentlyDragging: dragging,
    showStraightLines,
    setShowStraightLines,
  }
}

function pointFromEvent(event: MouseEvent, container: HTMLElement) {
  const containerRect = container.getBoundingClientRect()
  return {
    x: event.clientX - containerRect.left,
    y: event.clientY - containerRect.top,
  }
}

function distanceBetweenPoints(a: Point, b: Point): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
}

function findLast<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean,
): [T, number] | null {
  for (let index = array.length - 1; index >= 0; index--) {
    const item = array[index]
    if (predicate(item, index)) {
      return [item, index]
    }
  }

  return null
}

function lineRectIntersection(p1: Point, p2: Point, rect: Rect): Point | null {
  const intersections = [
    horizontalLineIntersection(p1, p2, rect.left, rect.right, rect.top),
    horizontalLineIntersection(p1, p2, rect.left, rect.right, rect.bottom),
    verticalLineIntersection(p1, p2, rect.left, rect.top, rect.bottom),
    verticalLineIntersection(p1, p2, rect.right, rect.top, rect.bottom),
  ].filter(
    (intersection): intersection is [number, Point] => intersection !== null,
  )

  const firstIntersection = minBy(intersections, ([t]) => t)
  if (!firstIntersection) {
    return null
  }

  return firstIntersection[1]
}

function horizontalLineIntersection(
  p1: Point,
  p2: Point,
  x1: number,
  x2: number,
  y: number,
): [number, Point] | null {
  if (p1.y === p2.y) {
    return null
  }

  const t = (y - p1.y) / (p2.y - p1.y)
  const x = p1.x + t * (p2.x - p1.x)

  if (isMonotonous(0, t, 1) && isMonotonous(x1, x, x2)) {
    return [t, { x, y }]
  } else {
    return null
  }
}

function verticalLineIntersection(
  p1: Point,
  p2: Point,
  x: number,
  y1: number,
  y2: number,
): [number, Point] | null {
  if (p1.x === p2.x) {
    return null
  }

  const t = (x - p1.x) / (p2.x - p1.x)
  const y = p1.y + t * (p2.y - p1.y)

  if (isMonotonous(0, t, 1) && isMonotonous(y1, y, y2)) {
    return [t, { x, y }]
  } else {
    return null
  }
}

function isMonotonous(a: number, b: number, c: number): boolean {
  return (a <= b && b <= c) || (a >= b && b >= c)
}

function minBy<T>(array: T[], value: (item: T) => number): T | null {
  if (array.length === 0) {
    return null
  }

  let minItem = array[0]
  let minValue = value(array[0])

  array.slice(1).forEach((item) => {
    const currentValue = value(item)
    if (currentValue < minValue) {
      minValue = currentValue
      minItem = item
    }
  })

  return minItem
}
