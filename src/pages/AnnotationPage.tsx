import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Code from '../components/Code'
import Controls from '../components/Controls'
import useCode from '../hooks/useCode'
import useKeyboardHandler from '../hooks/useKeyboardHandler'
import useSource from '../hooks/useSource'
import { clearSelection, removeArrow, removeMarker } from '../reducer'
import createStore, { useDispatch, useSelector } from '../store'
import { redo, undo } from '../undoable'

export default function AnnotationPage() {
  const source = useSource()
  const { store, persistor } = createStore(source)

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AnnotationPageContent />
      </PersistGate>
    </Provider>
  )
}

function AnnotationPageContent() {
  const source = useSource()
  const { code, error } = useCode(source)

  if (code) {
    return <LoadedPage code={code} />
  } else {
    return <LoadingPage error={error} />
  }
}

function LoadingPage({ error }: { error: Error | null }) {
  if (error) {
    return (
      <div>Oh no! Something went wrong while trying to fetch the code.</div>
    )
  } else {
    return <div>Fetching code...</div>
  }
}

function LoadedPage({ code }: { code: string }) {
  useReducerKeyboardHandler()

  return (
    <div>
      <Controls />
      <div className='container'>
        <Code code={code} />
      </div>
    </div>
  )
}

function useReducerKeyboardHandler() {
  const dispatch = useDispatch()
  const currentSelection = useSelector((state) => state.currentSelection)

  const handler = React.useCallback(
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

  useKeyboardHandler(handler)
}
