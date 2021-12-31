import React, { useEffect } from 'react'
import useArrowDrawing from '../hooks/useArrowDrawing'
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
      <Svg />
      <SelectionPopover />
    </ContainerDiv>
  )
}

function Svg() {
  const { currentArrow, mouseEvents } = useArrowDrawing()

  const selectionChangeHandler = useTextSelectionHandler()
  useEffect(() => {
    document.onselectionchange = selectionChangeHandler
  }, [selectionChangeHandler])

  return (
    <svg
      style={{
        pointerEvents: currentArrow ? 'auto' : 'none',
      }}
      onMouseMove={(e) => mouseEvents.svg.onMouseMove(e)}
      onMouseUp={(e) => mouseEvents.svg.onMouseUp(e)}
    >
      {currentArrow && <ArrowLine arrow={currentArrow} selectable={false} />}
      <Arrows arrowMouseEvents={mouseEvents.arrow} />
      <Markers markerMouseEvents={mouseEvents.marker} />
    </svg>
  )
}

type ArrowsProps = {
  arrowMouseEvents: ReturnType<typeof useArrowDrawing>['mouseEvents']['arrow']
}

function Arrows({ arrowMouseEvents }: ArrowsProps) {
  const dispatch = useDispatch()
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
