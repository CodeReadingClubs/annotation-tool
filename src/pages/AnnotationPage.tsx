import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Code from '../components/Code'
import Controls from '../components/Controls'
import useCode from '../hooks/useCode'
import useKeyboardHandler from '../hooks/useKeyboardHandler'
import useSource from '../hooks/useSource'
import createStore from '../store'

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
  const handler = useKeyboardHandler()
  useEffect(() => {
    document.onkeydown = handler
  }, [handler])

  return (
    <div>
      <Controls />
      <div className='container'>
        <Code code={code} />
      </div>
    </div>
  )
}
