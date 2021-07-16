import React, { useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { Selection } from '../types'

export default function useTextSelection(
  containerRef: React.MutableRefObject<HTMLDivElement | null>,
): [Selection | null, () => void] {
  const [selection, setSelection] = React.useState<Selection | null>(null)

  React.useEffect(() => {
    document.onselectionchange = () => {
      if (!containerRef.current) {
        throw new Error(`Invalid <pre> ref`)
      }
      const selection = document.getSelection()
      if (
        !selection ||
        selection.type !== 'Range' ||
        selection.anchorNode?.parentElement?.className !== 'code-line' ||
        selection.toString().includes('\n')
      ) {
        setSelection(null)
      } else {
        const rect = rangeRect(selection.getRangeAt(0))
        const parentRect = containerRef.current.getBoundingClientRect()
        setSelection({
          top: rect.top - parentRect.top,
          left: rect.left - parentRect.left,
          width: rect.width,
          height: rect.height,
          bottom: rect.bottom - parentRect.top,
          right: rect.right - parentRect.left,
          id: uuid(),
        })
      }
    }
  }, [])

  const clearSelection = useCallback(() => {
    document.getSelection()?.removeAllRanges()
    setSelection(null)
  }, [])

  return [selection, clearSelection]
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
