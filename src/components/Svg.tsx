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
      {drag && (
        <ArrowLine
          arrow={drag}
          straight={showStraightArrows}
          selectable={false}
        />
      )}
      <Arrows
        containerRef={containerRef}
        arrowMouseEvents={mouseEvents.arrow}
      />
      <Markers markerMouseEvents={mouseEvents.marker} />
    </svg>
  )
}

type ArrowsProps = {
  containerRef: React.MutableRefObject<SVGSVGElement | null>
  arrowMouseEvents: ReturnType<typeof useArrowDrawing>['mouseEvents']['arrow']
}

function Arrows({ containerRef, arrowMouseEvents }: ArrowsProps) {
  const dispatch = useDispatch()
  const arrows = useSelector((state) => Object.values(state.arrows))
  const showStraightArrows = useSelector((state) => state.showStraightArrows)
  const currentSelection = useSelector((state) => state.currentSelection)

  return (
    <>
      {arrows.map((arrow) => (
        <ArrowLine
          arrow={arrow}
          straight={showStraightArrows}
          selectable={currentSelection?.type !== 'text'}
          onClick={(e) =>
            dispatch(
              selectArrow({
                arrow,
                point: pointFromEvent(e, containerRef.current!),
              }),
            )
          }
          onMouseDown={(e) => arrowMouseEvents.onMouseDown(e, arrow)}
          highlighted={
            currentSelection?.type === 'arrow' &&
            (arrow.id === currentSelection.arrow.id ||
              currentSelection.arrow.id in arrow.dependencies)
          }
          key={arrow.id}
        />
      ))}
    </>
  )
}

type MarkersProps = {
  markerMouseEvents: ReturnType<typeof useArrowDrawing>['mouseEvents']['marker']
}

function Markers({ markerMouseEvents }: MarkersProps) {
  const dispatch = useDispatch()
  const markers = useSelector((state) => Object.values(state.markers))
  const currentSelection = useSelector((state) => state.currentSelection)

  return (
    <>
      {markers.map((marker) => (
        <MarkerRect
          key={marker.id}
          marker={marker}
          selectable={currentSelection?.type !== 'text'}
          onClick={() => dispatch(selectMarker(marker))}
          onMouseDown={(e) => markerMouseEvents.onMouseDown(e, marker)}
          onMouseMove={(e) => markerMouseEvents.onMouseMove(e, marker)}
          onMouseUp={(e) => markerMouseEvents.onMouseUp(e, marker)}
        />
      ))}
    </>
  )
}
