import { useEffect, useState } from 'react'
import * as github from '../github'
import { localStorageKey, Source } from '../source'

type FetchState =
  | { type: 'loading' }
  | { type: 'success'; code: string }
  | { type: 'failure'; error: Error }

export default function useCode(source: Source): {
  code: string | null
  loading: boolean
  error: Error | null
} {
  const key = `persist:code:${localStorageKey(source)}`
  const [fetchState, setFetchState] = useState<FetchState>(() => {
    const localCode = localStorage.getItem(key)
    if (localCode === null) {
      return { type: 'loading' }
    }
    return { type: 'success', code: localCode }
  })

  useEffect(() => {
    const localCode = localStorage.getItem(key)
    if (localCode !== null) {
      setFetchState({ type: 'success', code: localCode })
    } else {
      setFetchState({ type: 'loading' })
      github
        .fetchCode(source.file)
        .then((code) => {
          setFetchState({ type: 'success', code })
          localStorage.setItem(key, code)
        })
        .catch((error) => {
          setFetchState({ type: 'failure', error })
        })
    }
  }, [source])

  return {
    code: fetchState.type === 'success' ? fetchState.code : null,
    loading: fetchState.type === 'loading',
    error: fetchState.type === 'failure' ? fetchState.error : null,
  }
}
