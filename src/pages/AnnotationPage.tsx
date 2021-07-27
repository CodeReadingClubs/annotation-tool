import React, { useEffect, useMemo, useState } from 'react'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import Code from '../components/Code'
import Controls from '../components/Controls'
import SelectionPopover from '../components/SelectionPopover'
import Svg from '../components/Svg'
import * as github from '../github'
import useKeyboardUndoHandler from '../hooks/useKeyboardUndoHandler'
import { setCode } from '../reducer'
import createStore, { useDispatch, useSelector } from '../store'

function useFilePath(): string | null {
  const { hash } = useParams<{ hash?: string }>()
  if (!hash) {
    return null
  }
  return github.parseFileHash(hash)
}

function useFile(): github.File | null {
  const filePath = useFilePath()
  if (!filePath) {
    return null
  }

  return useMemo(() => github.parsePath(filePath), [filePath])
}

export default function AnnotationPageWrapper() {
  const filePath = useFilePath()
  if (!filePath) {
    return <div>Something's wrong with the url.</div>
  }
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
  const code = useSelector((state) => state.code)

  if (code) {
    return <LoadedPage />
  } else {
    return <LoadingPage />
  }
}

function LoadingPage() {
  const file = useFile()
  const dispatch = useDispatch()
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!file) {
      setError(new Error(`Can't parse file path`))
      return
    }
    github
      .fetchCode(file)
      .then((code) => {
        dispatch(setCode(code))
      })
      .catch((error) => setError(error))
  }, [file])

  if (error) {
    return (
      <div>Oh no! Something went wrong while trying to fetch the code.</div>
    )
  } else {
    return <div>Fetching code...</div>
  }
}

function LoadedPage() {
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
