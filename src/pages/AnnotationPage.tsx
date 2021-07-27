import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Code from '../components/Code'
import Controls from '../components/Controls'
import SelectionPopover from '../components/SelectionPopover'
import Svg from '../components/Svg'
import useKeyboardUndoHandler from '../hooks/useKeyboardUndoHandler'
import createStore from '../store'

const filePath =
  'CodeReadingClubs/www/blob/908de054006934a071f770906119ce6d35a5a612/package.json'

export default function AnnotationPageWrapper() {
  const { store, persistor } = createStore(filePath)

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AnnotationPage />
      </PersistGate>
    </Provider>
  )
}

function AnnotationPage() {
  const handler = useKeyboardUndoHandler()
  useEffect(() => {
    document.onkeydown = handler
  }, [handler])

  return (
    <div>
      <Controls />
      <div className='container'>
        <Code />
        <Svg />
        <SelectionPopover />
      </div>
    </div>
  )
}
