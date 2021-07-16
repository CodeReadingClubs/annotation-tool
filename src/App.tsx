import React from 'react'
import Arrow from './components/Arrow'
import Code from './components/Code'
import MarkerRect from './components/MarkerRect'
import { Popover } from './components/Popover'
import { Marker, Selection } from './types'
import useLines from './hooks/useLines'
import useTextSelection from './hooks/useTextSelection'

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
const colors = ['lightblue', 'lightgreen', 'gold', 'pink']

export default function App() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const [textSelection, clearTextSelection] = useTextSelection(containerRef)
  const [markers, setMarkers] = React.useState<Marker[]>([])
  const [selectedMarker, setSelectedMarker] = React.useState<Marker | null>(
    null,
  )
  const {
    lines,
    removeLinesWithMarkerId,
    currentlyDragging,
    showStraightLines,
    setShowStraightLines,
    ...mouseEvents
  } = useLines(containerRef)

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
        <Code code={code} />
        <svg
          style={{
            pointerEvents: currentlyDragging ? 'auto' : 'none',
          }}
          onMouseMove={(e) => mouseEvents.onMouseMove(e)}
          onMouseUp={(e) => mouseEvents.onMouseUp(e)}
        >
          {currentlyDragging && (
            <Arrow line={currentlyDragging} straight={showStraightLines} />
          )}
          {lines.map((line) => (
            <Arrow line={line} straight={showStraightLines} key={line.id} />
          ))}
          {markers.map((marker) => (
            <MarkerRect
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
