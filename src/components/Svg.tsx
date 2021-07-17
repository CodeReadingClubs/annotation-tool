import React, { useEffect } from 'react'
import { shallowEqual } from 'react-redux'
import useArrowDrawing from '../hooks/useArrowDrawing'
import useTextSelectionHandler from '../hooks/useTextSelectionHandler'
import { selectArrow, selectMarker } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { pointFromEvent } from '../util'
import ArrowLine from './ArrowLine'
import MarkerRect from './MarkerRect'

export default function Svg() {
  const containerRef = React.useRef<SVGSVGElement | null>(null)
  const dispatch = useDispatch()
  const { currentSelection, markers, arrows, showStraightArrows } = useSelector(
    (state) => state,
    shallowEqual,
  )
  const { drag, mouseEvents } = useArrowDrawing(containerRef)

  const selectionChangeHandler = useTextSelectionHandler(containerRef)
  useEffect(() => {
    document.onselectionchange = selectionChangeHandler
  }, [selectionChangeHandler])

  return (
    <svg
      ref={containerRef}
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
  )
}
