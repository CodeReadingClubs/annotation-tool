import React from 'react'
import { shallowEqual } from 'react-redux'
import ArrowLine from './components/ArrowLine'
import Code from './components/Code'
import MarkerRect from './components/MarkerRect'
import { Popover } from './components/Popover'
import Settings from './components/Settings'
import useArrowDrawing from './hooks/useArrowDrawing'
import useTextSelection from './hooks/useTextSelection'
import {
  addMarker,
  clearSelection,
  removeArrow,
  removeMarker,
  selectArrow,
  selectMarker,
} from './reducer'
import { useDispatch, useSelector } from './store'
import { pointFromEvent } from './util'

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
  useTextSelection(containerRef)
  const dispatch = useDispatch()
  const { currentSelection, markers, arrows, colors, showStraightArrows } =
    useSelector((state) => state, shallowEqual)
  const { drag, mouseEvents } = useArrowDrawing(containerRef)

  return (
    <div>
      <Settings />
      <div className='container' ref={containerRef}>
        <Code />
        <svg
          style={{
            pointerEvents: drag ? 'auto' : 'none',
          }}
          onMouseMove={(e) => mouseEvents.svg.onMouseMove(e)}
          onMouseUp={(e) => mouseEvents.svg.onMouseUp(e)}
        >
          {drag && <ArrowLine arrow={drag} straight={showStraightArrows} />}
          {arrows.map((arrow) => (
            <ArrowLine
              arrow={arrow}
              straight={showStraightArrows}
              onClick={(e) =>
                dispatch(
                  selectArrow({
                    arrow,
                    point: pointFromEvent(e, containerRef.current!),
                  }),
                )
              }
              onMouseDown={(e) => mouseEvents.arrow.onMouseDown(e, arrow)}
              highlighted={
                currentSelection?.type === 'arrow' &&
                (arrow.id === currentSelection.arrow.id ||
                  currentSelection.arrow.id in arrow.dependencies)
              }
              key={arrow.id}
            />
          ))}
          {markers.map((marker) => (
            <MarkerRect
              marker={marker}
              key={marker.id}
              onClick={() => dispatch(selectMarker(marker))}
              onMouseDown={(e) => mouseEvents.marker.onMouseDown(e, marker)}
              onMouseMove={(e) => mouseEvents.marker.onMouseMove(e, marker)}
              onMouseUp={(e) => mouseEvents.marker.onMouseUp(e, marker)}
            />
          ))}
        </svg>
        <SelectionPopover />
        {/* {selectedMarker && (
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
        )} */}
      </div>
    </div>
  )
}

function SelectionPopover() {
  const currentSelection = useSelector(
    (state) => state.currentSelection,
    shallowEqual,
  )
  const colors = useSelector((state) => state.colors, shallowEqual)
  const dispatch = useDispatch()

  if (!currentSelection) {
    return null
  }

  switch (currentSelection.type) {
    case 'text': {
      return (
        <Popover
          origin={{
            x: currentSelection.rect.left + currentSelection.rect.width / 2,
            y: currentSelection.rect.bottom,
          }}
        >
          {colors.map((color) => (
            <button
              key={color}
              className='color-button'
              style={{ '--color': color } as React.CSSProperties}
              onClick={() =>
                dispatch(addMarker({ rect: currentSelection.rect, color }))
              }
            />
          ))}
        </Popover>
      )
    }
    case 'marker': {
      return (
        <Popover
          origin={{
            x: currentSelection.marker.left + currentSelection.marker.width / 2,
            y: currentSelection.marker.bottom,
          }}
          onBlur={() => dispatch(clearSelection())}
        >
          <button
            onClick={() => dispatch(removeMarker(currentSelection.marker))}
          >
            remove
          </button>
        </Popover>
      )
    }
    case 'arrow': {
      return (
        <Popover
          origin={currentSelection.point}
          onBlur={() => dispatch(clearSelection())}
        >
          <button onClick={() => dispatch(removeArrow(currentSelection.arrow))}>
            remove
          </button>
        </Popover>
      )
    }
  }
}
