import React, { MouseEvent } from 'react'
import colors from './colors'
import ArrowLine from './components/ArrowLine'
import Code from './components/Code'
import MarkerRect from './components/MarkerRect'
import { Popover } from './components/Popover'
import useArrows from './hooks/useArrows'
import useTextSelection from './hooks/useTextSelection'
import { Arrow, Marker, Point, Selection } from './types'
import { pointFromEvent, toggleSetMember } from './util'

const code = `function configFromInput(config) {
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

export default function App() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [textSelection, clearTextSelection] = useTextSelection(containerRef)
  const [markers, setMarkers] = React.useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = React.useState<Marker | null>(
    null,
  )
  const [selectedArrow, setSelectedArrow] = React.useState<{
    arrow: Arrow
    point: Point
  } | null>(null)
  const [lineAnnotations, setLineAnnotations] = React.useState<
    Map<number, Set<string>>
  >(new Map())

  const {
    arrows,
    removeArrowsWithMarkerId,
    removeArrowWithId,
    currentlyDragging,
    showStraightArrows,
    setShowStraightArrows,
    mouseEvents,
  } = useArrows(containerRef)

  const addMarker = (selection: Selection, color: string) => {
    setMarkers((markers) => [
      ...markers,
      {
        ...selection,
        color,
      },
    ])
    clearTextSelection()
  }

  const removeMarker = (marker: Marker) => {
    setMarkers((markers) => markers.filter((m) => m.id !== marker.id))
    removeArrowsWithMarkerId(marker.id)
    setSelectedMarker(null)
  }

  const selectArrow = (event: MouseEvent, arrow: Arrow) => {
    const point = pointFromEvent(event, containerRef.current!)
    setSelectedArrow({ arrow, point })
  }

  const removeArrow = (arrow: Arrow) => {
    removeArrowWithId(arrow.id)
    setSelectedArrow(null)
  }

  const toggleLineAnnotation = (line: number, color: string) => {
    const newAnnotations = new Map(lineAnnotations)
    newAnnotations.set(
      line,
      toggleSetMember(lineAnnotations.get(line) ?? new Set(), color),
    )
    setLineAnnotations(newAnnotations)
  }

  return (
    <div>
      <div>
        <input
          type='checkbox'
          id='straight-arrows'
          checked={showStraightArrows}
          onChange={(e) => setShowStraightArrows(e.target.checked)}
        />
        <label htmlFor='straight-arrows'>Use straight arrows</label>
      </div>
      <div className='container' ref={containerRef}>
        <Code
          code={code}
          annotations={lineAnnotations}
          toggleAnnotation={toggleLineAnnotation}
        />
        <svg
          style={{
            pointerEvents: currentlyDragging ? 'auto' : 'none',
          }}
          onMouseMove={(e) => mouseEvents.svg.onMouseMove(e)}
          onMouseUp={(e) => mouseEvents.svg.onMouseUp(e)}
        >
          {currentlyDragging && (
            <ArrowLine
              arrow={currentlyDragging}
              straight={showStraightArrows}
            />
          )}
          {arrows.map((arrow) => (
            <ArrowLine
              arrow={arrow}
              straight={showStraightArrows}
              onClick={(e) => selectArrow(e, arrow)}
              onMouseDown={(e) => mouseEvents.arrow.onMouseDown(e, arrow)}
              highlighted={
                selectedArrow !== null &&
                (arrow.id === selectedArrow.arrow.id ||
                  arrow.dependencies.has(selectedArrow.arrow.id))
              }
              key={arrow.id}
            />
          ))}
          {markers.map((marker) => (
            <MarkerRect
              marker={marker}
              key={marker.id}
              onClick={() => setSelectedMarker(marker)}
              onMouseDown={(e) => mouseEvents.marker.onMouseDown(e, marker)}
              onMouseMove={(e) => mouseEvents.marker.onMouseMove(e, marker)}
              onMouseUp={(e) => mouseEvents.marker.onMouseUp(e, marker)}
            />
          ))}
        </svg>
        {selectedMarker && (
          <Popover
            origin={{
              x: selectedMarker.left + selectedMarker.width / 2,
              y: selectedMarker.bottom,
            }}
            onBlur={() => setSelectedMarker(null)}
          >
            <button onClick={() => removeMarker(selectedMarker)}>remove</button>
          </Popover>
        )}
        {selectedArrow && (
          <Popover
            origin={selectedArrow.point}
            onBlur={() => setSelectedArrow(null)}
          >
            <button onClick={() => removeArrow(selectedArrow.arrow)}>
              remove
            </button>
          </Popover>
        )}
        {textSelection && (
          <Popover
            origin={{
              x: textSelection.left + textSelection.width / 2,
              y: textSelection.bottom,
            }}
          >
            {colors.map((color) => (
              <button
                key={color}
                className='color-button'
                style={{ '--color': color } as React.CSSProperties}
                onClick={() => addMarker(textSelection, color)}
              />
            ))}
          </Popover>
        )}
      </div>
    </div>
  )
}
