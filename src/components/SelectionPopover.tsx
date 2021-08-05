import React from 'react'
import { shallowEqual } from 'react-redux'
import { addMarker, removeArrow, removeMarker } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { Popover } from './Popover'

export default function SelectionPopover() {
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
          autofocus
          origin={{
            x: currentSelection.marker.left + currentSelection.marker.width / 2,
            y: currentSelection.marker.bottom,
          }}
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
        <Popover autofocus origin={currentSelection.point}>
          <button onClick={() => dispatch(removeArrow(currentSelection.arrow))}>
            remove
          </button>
        </Popover>
      )
    }
  }
}
