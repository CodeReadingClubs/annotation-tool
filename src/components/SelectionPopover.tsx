import React from 'react'
import { shallowEqual } from 'react-redux'
import { addMarker, removeArrow, removeMarker } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { Arrow, Marker, Point, Rect } from '../types'
import { Popover } from './Popover'

export default function SelectionPopover() {
  const currentSelection = useSelector(
    (state) => state.currentSelection,
    shallowEqual,
  )

  if (!currentSelection) {
    return null
  }

  switch (currentSelection.type) {
    case 'text': {
      return <TextPopover rect={currentSelection.rect} />
    }
    case 'marker': {
      return <MarkerPopover marker={currentSelection.marker} />
    }
    case 'arrow': {
      return (
        <ArrowPopover
          arrow={currentSelection.arrow}
          point={currentSelection.point}
        />
      )
    }
  }
}

function TextPopover({ rect }: { rect: Rect }) {
  const dispatch = useDispatch()
  const colors = useSelector((state) => state.colors, shallowEqual)
  return (
    <Popover
      origin={{
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      }}
    >
      {colors.map((color) => (
        <button
          key={color}
          className='color-button'
          style={{ '--color': color } as React.CSSProperties}
          onClick={() => dispatch(addMarker({ rect, color }))}
        />
      ))}
    </Popover>
  )
}

function MarkerPopover({ marker }: { marker: Marker }) {
  const dispatch = useDispatch()
  return (
    <Popover
      autofocus
      origin={{
        x: marker.left + marker.width / 2,
        y: marker.bottom,
      }}
      className='popover--marker'
    >
      <button onClick={() => dispatch(removeMarker(marker))}>remove</button>
    </Popover>
  )
}

function ArrowPopover({ arrow, point }: { arrow: Arrow; point: Point }) {
  const dispatch = useDispatch()
  return (
    <Popover autofocus origin={point} className='popover--arrow'>
      <button onClick={() => dispatch(removeArrow(arrow))}>remove</button>
    </Popover>
  )
}
