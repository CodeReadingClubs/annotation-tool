import React, { useEffect } from 'react'
import {
  ArrowDrawingProvider,
  useCurrentArrowDrawing,
  useDrawingEventHandlers,
} from '../hooks/useArrowDrawing'
import { ContainerDiv } from '../hooks/useContainer'
import useTextSelectionHandler from '../hooks/useTextSelectionHandler'
import { useSelector } from '../store'
import { FinishedArrowLine, UnfinishedArrowLine } from './ArrowLine'
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
  const drawing = useDrawingEventHandlers()

  const selectionChangeHandler = useTextSelectionHandler()
  useEffect(() => {
    document.onselectionchange = selectionChangeHandler
  }, [selectionChangeHandler])

  return (
    <svg
      style={{
        pointerEvents: currentArrow ? 'auto' : 'none',
      }}
      onMouseMove={(event) => drawing.onMouseMove(event, null)}
      onClick={(event) => drawing.onClick(event, null)}
    >
      <UnfinishedArrowLine />
      <Arrows />
      <Markers />
    </svg>
  )
}

function Arrows() {
  const arrows = useSelector((state) => Object.values(state.arrows))
  const currentSelection = useSelector((state) => state.currentSelection)

  return (
    <>
      {arrows.map((arrow) => (
        <FinishedArrowLine
          arrow={arrow}
          selectable={currentSelection?.type !== 'text'}
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
  const markers = useSelector((state) => Object.values(state.markers))
  const currentSelection = useSelector((state) => state.currentSelection)

  return (
    <>
      {markers.map((marker) => (
        <MarkerRect
          key={marker.id}
          marker={marker}
          selectable={currentSelection?.type !== 'text'}
        />
      ))}
    </>
  )
}
