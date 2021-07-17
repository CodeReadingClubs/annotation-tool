import { useCallback } from 'react'
import { useDispatch } from '../store'
import { redo, undo } from '../undoable'

export default function useKeyboardUndoHandler() {
  const dispatch = useDispatch()

  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.key === 'z' &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey
      ) {
        event.preventDefault()
        event.stopPropagation()
        dispatch(redo())
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        event.stopPropagation()
        dispatch(undo())
      }
    },
    [dispatch],
  )

  return handler
}
