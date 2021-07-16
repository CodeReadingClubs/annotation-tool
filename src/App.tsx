import React, { MouseEvent, PropsWithChildren } from 'react'
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
type Selection = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
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
  toPoint: Point | null
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
  const [selection, setSelection] = React.useState<Selection | null>(null)
  const [markers, setMarkers] = React.useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = React.useState<Marker | null>(
    null,
  )
  const [dragging, setDragging] = React.useState<UnfinishedLine | null>(null)
  const [lines, setLines] = React.useState<Line[]>([])
  const [straightArrows, setStraightArrows] = React.useState(true)

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

  const addMarker = (selection: Selection, color: string) => {
    console.log({ selection })
    setMarkers((markers) => [
      ...markers,
      {
        ...selection,
        color,
      },
    ])
    setSelection(null)
    document.getSelection()?.removeAllRanges()
  }

  const removeMarker = (marker: Marker) => {
    setMarkers((markers) => markers.filter((m) => m.id !== marker.id))
    setLines((lines) =>
      lines.filter(
        (line) =>
          line.fromMarker.id !== marker.id && line.toMarker.id !== marker.id,
      ),
    )
    setSelectedMarker(null)
  }

  return (
    <div>
      <div>
        <input
          type='checkbox'
          id='straight-arrows'
          checked={straightArrows}
          onChange={(e) => setStraightArrows(e.target.checked)}
        />
        <label htmlFor='straight-arrows'>Use straight arrows</label>
      </div>
      <div className='container' ref={containerRef}>
        <pre>{code}</pre>
        <svg
          style={{
            pointerEvents: dragging ? 'auto' : 'none',
          }}
          onMouseMove={(e) => {
            if (!dragging) {
              return
            }
            const svgRect = containerRef.current!.getBoundingClientRect()
            const currentPoint = {
              x: e.clientX - svgRect.left,
              y: e.clientY - svgRect.top,
            }
            setDragging({
              ...dragging,
              midPoints: [...dragging.midPoints, currentPoint],
              toPoint: currentPoint,
              toMarker: null,
            })
          }}
          onMouseUp={(e) => {
            setDragging(null)
          }}
        >
          {dragging && <Line line={dragging} straight={straightArrows} />}
          {lines.map((line) => (
            <Line line={line} straight={straightArrows} key={line.id} />
          ))}
          {markers.map((marker, index) => (
            <Marker
              marker={marker}
              key={marker.id}
              onClick={() => setSelectedMarker(marker)}
              onMouseDown={(e) => {
                e.preventDefault()
                const svgRect = containerRef.current!.getBoundingClientRect()
                setDragging({
                  fromMarker: marker,
                  fromPoint: {
                    x: e.clientX - svgRect.left,
                    y: e.clientY - svgRect.top,
                  },
                  midPoints: [],
                  toPoint: null,
                  toMarker: null,
                })
                console.log('start')
              }}
              onMouseMove={(e) => {
                if (!dragging) {
                  return
                }

                e.stopPropagation()
                if (marker.id === dragging.fromMarker.id) {
                  return
                }
                const svgRect = containerRef.current!.getBoundingClientRect()
                const currentPoint = {
                  x: e.clientX - svgRect.left,
                  y: e.clientY - svgRect.top,
                }
                setDragging({
                  ...dragging,
                  midPoints: [...dragging.midPoints, currentPoint],
                  toPoint: currentPoint,
                  toMarker: marker,
                })
              }}
              onMouseUp={(e) => {
                if (!dragging) {
                  return
                }

                if (marker.id === dragging.fromMarker.id) {
                  setDragging(null)
                } else {
                  const svgRect = containerRef.current!.getBoundingClientRect()
                  const line = {
                    fromMarker: dragging.fromMarker,
                    fromPoint: dragging.fromPoint,
                    midPoints: dragging.midPoints,
                    toMarker: marker,
                    toPoint: {
                      x: e.clientX - svgRect.left,
                      y: e.clientY - svgRect.top,
                    },
                    id: uuid(),
                  }
                  setLines((lines) => [...lines, line])
                  setDragging(null)
                }
              }}
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
  if (!line || !line.toPoint) {
    return null
  }

  if (!line.toMarker) {
    return (
      <Arrow
        from={line.fromPoint}
        to={line.toPoint}
        midPoints={straight ? [] : line.midPoints}
        color={line.fromMarker.color}
      />
    )
  }

  const endPoint = endPointForLine(line)

  return (
    <Arrow
      from={line.fromPoint}
      to={endPoint}
      midPoints={straight ? [] : line.midPoints}
      color={line.fromMarker.color}
    />
  )
}

type ArrowProps = {
  from: Point
  to: Point
  midPoints: Point[]
  color: string
}

function Arrow({ from, to, midPoints, color }: ArrowProps) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const isLong = Math.max(Math.abs(dx), Math.abs(dy)) > 40

  const points = [from, ...midPoints, to]
  const count = points.length
  const angle = Math.atan2(
    points[count - 1].y - points[count - 2].y,
    points[count - 1].x - points[count - 2].x,
  )
  console.log(points)
  const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ')

  return (
    <g>
      <polyline
        points={pointsString}
        stroke={color}
        fill='none'
        strokeWidth='3'
      />
      {isLong && (
        <line
          x1={to.x}
          y1={to.y}
          x2={to.x + 15 * Math.cos(angle + Math.PI + Math.PI / 8)}
          y2={to.y + 15 * Math.sin(angle + Math.PI + Math.PI / 8)}
          stroke={color}
          strokeWidth='3'
        />
      )}
      {isLong && (
        <line
          x1={to.x}
          y1={to.y}
          x2={to.x + 15 * Math.cos(angle + Math.PI - Math.PI / 8)}
          y2={to.y + 15 * Math.sin(angle + Math.PI - Math.PI / 8)}
          stroke={color}
          strokeWidth='3'
        />
      )}
    </g>
  )
}

function endPointForLine(line: Line | UnfinishedLine) {
  if (!line.toMarker || !line.toPoint) {
    return line.toPoint ?? line.midPoints[0] ?? line.fromPoint
  }
  if (Math.abs(line.toPoint.x - line.fromPoint.x) < 0.01) {
    if (line.fromPoint.y < line.toMarker.top) {
      return { x: line.toPoint.x, y: line.toMarker.top }
    } else if (line.fromPoint.y > line.toMarker.bottom) {
      return { x: line.toPoint.x, y: line.toMarker.bottom }
    } else {
      return line.toPoint
    }
  }
  const m =
    (line.toPoint.y - line.fromPoint.y) / (line.toPoint.x - line.fromPoint.x)
  const n = line.fromPoint.y - m * line.fromPoint.x

  const xTop = (line.toMarker.top - n) / m
  const xBottom = (line.toMarker.bottom - n) / m
  const yLeft = m * line.toMarker.left + n
  const yRight = m * line.toMarker.right + n

  if (
    line.fromPoint.y < line.toPoint.y &&
    xTop > line.toMarker.left &&
    xTop < line.toMarker.right
  ) {
    return { x: xTop, y: line.toMarker.top }
  } else if (
    line.fromPoint.y > line.toPoint.y &&
    xBottom > line.toMarker.left &&
    xBottom < line.toMarker.right
  ) {
    return { x: xBottom, y: line.toMarker.bottom }
  } else if (
    line.fromPoint.x < line.toPoint.x &&
    yLeft > line.toMarker.top &&
    yLeft < line.toMarker.bottom
  ) {
    return { x: line.toMarker.left, y: yLeft }
  } else if (
    line.fromPoint.x > line.toPoint.x &&
    yRight > line.toMarker.top &&
    yRight < line.toMarker.bottom
  ) {
    return { x: line.toMarker.right, y: yRight }
  } else {
    return line.toPoint
  }
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
