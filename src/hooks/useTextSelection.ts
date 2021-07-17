import React from 'react'
import { clearSelection, selectText } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function useTextSelection(
  containerRef: React.MutableRefObject<SVGSVGElement | null>,
) {
  const dispatch = useDispatch()
  const isTextCurrentlySelected = useSelector(
    (state) => state.currentSelection?.type === 'text',
  )

  React.useEffect(() => {
    document.onselectionchange = () => {
      if (!containerRef.current) {
        throw new Error(`Invalid container ref`)
      }
      const selection = document.getSelection()
      if (
        !selection ||
        selection.type !== 'Range' ||
        selection.anchorNode?.parentElement?.className !== 'code-line' ||
        selection.toString().includes('\n')
      ) {
        if (isTextCurrentlySelected) {
          dispatch(clearSelection())
        }
      } else {
        const rect = rangeRect(selection.getRangeAt(0))
        const parentRect = containerRef.current.getBoundingClientRect()
        const rectInContainerCoordinates = {
          top: rect.top - parentRect.top,
          left: rect.left - parentRect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom - parentRect.top,
          right: rect.right - parentRect.left,
        }
        dispatch(selectText(rectInContainerCoordinates))
      }
    }
  }, [])
}

function rangeRect(range: Range): DOMRect {
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0,
  )
  if (rects.length !== 1) {
    throw new Error(`Can't deal with range with ${rects.length} rects`)
  }

  return rects[0]
}
