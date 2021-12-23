import React, { useEffect } from 'react'
import {
  ArrowDrawingProvider,
  useArrowDrawingEventHandlers,
  useCurrentArrowDrawing,
} from '../hooks/useArrowDrawing'
import { ContainerDiv, useContainer } from '../hooks/useContainer'
import useTextSelectionHandler from '../hooks/useTextSelectionHandler'
import { selectArrow, selectMarker } from '../reducer'
import { useDispatch, useSelector } from '../store'
import ArrowLine from './ArrowLine'
import MarkerRect from './MarkerRect'
import SelectionPopover from './SelectionPopover'

export default function CodeAnnotations({
  numberOfLines,
}: {
  numberOfLines: number
}) {
  return (
    <ContainerDiv
      className='svg-container'
      style={{
        gridRow: `1 / span ${numberOfLines}`,
      }}
    >
      <ArrowDrawingProvider>
        <Svg />
        <SelectionPopover />
      </ArrowDrawingProvider>
    </ContainerDiv>
  )
}

function Svg() {
  const currentArrow = useCurrentArrowDrawing()
  const { svgMouseEvents } = useArrowDrawingEventHandlers()

  const selectionChangeHandler = useTextSelectionHandler()
  useEffect(() => {
    document.onselectionchange = selectionChangeHandler
  }, [selectionChangeHandler])

  return (
    <svg
      style={{
        pointerEvents: currentArrow ? 'auto' : 'none',
      }}
      onMouseMove={(e) => svgMouseEvents.onMouseMove(e)}
      onMouseUp={(e) => svgMouseEvents.onMouseUp(e)}
    >
      {currentArrow && <ArrowLine arrow={currentArrow} selectable={false} />}
      <Arrows />
      <Markers />
    </svg>
  )
}

function Arrows() {
  const dispatch = useDispatch()
  const { arrowMouseEvents } = useArrowDrawingEventHandlers()
  const arrows = useSelector((state) => Object.values(state.arrows))
  const currentSelection = useSelector((state) => state.currentSelection)
  const { eventCoordinates } = useContainer()

  return (
    <>
      {arrows.map((arrow) => (
        <ArrowLine
          arrow={arrow}
          selectable={currentSelection?.type !== 'text'}
          onClick={(e) =>
            dispatch(
              selectArrow({
                arrow,
                point: eventCoordinates(e),
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

function Markers() {
  const dispatch = useDispatch()
  const { markerMouseEvents } = useArrowDrawingEventHandlers()
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
