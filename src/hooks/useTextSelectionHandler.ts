import React from 'react'
import { clearSelection, selectText } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { TextRange } from '../types'

export default function useTextSelectionHandler(
  containerRef: React.MutableRefObject<SVGSVGElement | null>,
) {
  const dispatch = useDispatch()
  const isTextCurrentlySelected = useSelector(
    (state) => state.currentSelection?.type === 'text',
  )

  const handler = React.useCallback(() => {
    if (!containerRef.current) {
      throw new Error(`Invalid container ref`)
    }
    const selection = document.getSelection()
    if (
      !selection ||
      selection.type !== 'Range' ||
      (selection.anchorNode?.parentElement?.className !== 'code-line' &&
        selection.focusNode?.parentElement?.className !== 'code-line') ||
      selection.toString().trim().includes('\n')
    ) {
      if (isTextCurrentlySelected) {
        dispatch(clearSelection())
      }
    } else {
      const rect = selectionRect(selection)
      const textRange = selectionTextRange(selection)
      const parentRect = containerRef.current.getBoundingClientRect()
      const rectInContainerCoordinates = {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom - parentRect.top,
        right: rect.right - parentRect.left,
        ...textRange,
      }
      dispatch(selectText(rectInContainerCoordinates))
    }
  }, [isTextCurrentlySelected])

  return handler
}

function selectionRect(selection: Selection): DOMRect {
  const range = selection.getRangeAt(0)
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0,
  )
  switch (rects.length) {
    case 1: {
      return rects[0]
    }
    case 2: {
      const selectionString = selection.toString()
      if (selectionString.startsWith('\n')) {
        return rects[1]
      } else if (selectionString.endsWith('\n')) {
        return rects[0]
      }
    }
    default: {
      throw new Error(`Can't handle a selection that has ${rects.length} rects`)
    }
  }
}

function selectionTextRange(selection: Selection): TextRange {
  const selectionString = selection.toString().replace('\n', '')
  const range = selection.getRangeAt(0)
  const lineNumber = parseInt(
    selection.anchorNode?.parentElement?.dataset.lineNumber ?? '',
  )
  if (isNaN(lineNumber)) {
    throw new Error(
      `Can't parse the line number of the current text selection ('${selection.toString()}')`,
    )
  }
  const endOffset =
    range.endOffset === 0
      ? range.startOffset + selectionString.length
      : range.endOffset
  return {
    text: selectionString,
    lineNumber,
    startOffset: range.startOffset,
    endOffset,
  }
}
