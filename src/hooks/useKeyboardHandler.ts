import { useCallback } from 'react'
import { clearSelection, removeArrow, removeMarker } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { redo, undo } from '../undoable'

export default function useKeyboardHandler() {
  const dispatch = useDispatch()
  const currentSelection = useSelector((state) => state.currentSelection)

  const handler = useCallback(
    (event: KeyboardEvent) => {
      const isMetaOn = event.ctrlKey || event.metaKey
      if (event.key === 'z' && isMetaOn && event.shiftKey) {
        // redo
        event.preventDefault()
        event.stopPropagation()
        dispatch(redo())
      } else if (event.key === 'z' && isMetaOn) {
        // undo
        event.preventDefault()
        event.stopPropagation()
        dispatch(undo())
      } else if (
        ['Backspace', 'Delete'].includes(event.key) &&
        currentSelection
      ) {
        // remove currently selected marker/arrow
        switch (currentSelection.type) {
          case 'text': {
            return
          }
          case 'marker': {
            dispatch(removeMarker(currentSelection.marker))
            return
          }
          case 'arrow': {
            dispatch(removeArrow(currentSelection.arrow))
            return
          }
        }
      } else if (event.key === 'Escape' && currentSelection) {
        dispatch(clearSelection())
        if (currentSelection.type === 'text') {
          document.getSelection()?.removeAllRanges()
        }
      }
    },
    [dispatch, currentSelection],
  )

  return handler
}
