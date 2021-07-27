import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import * as github from '../github'
import { setCode } from '../reducer'
import { useDispatch } from '../store'

type Fetching =
  | { type: 'not-requested' }
  | { type: 'loading' }
  | { type: 'failure'; error: Error }

export default function SourceSelectionPage() {
  const [url, setUrl] = useState('')
  const file = github.parsePath(url)
  const [fetching, setFetching] = useState<Fetching>({ type: 'not-requested' })
  const dispatch = useDispatch()

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!file) {
        return
      }
      setFetching({ type: 'loading' })
      github
        .fetchCode(file)
        .then((code) => dispatch(setCode(code)))
        .catch((error) => setFetching({ type: 'failure', error }))
    },
    [url],
  )

  const onType = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (fetching.type === 'failure') {
        setFetching({ type: 'not-requested' })
      }
      setUrl(e.target.value)
    },
    [fetching],
  )

  return (
    <form onSubmit={onSubmit}>
      <input value={url} onChange={onType} />
      {file === null && <p role='alert'>that's not a github file url</p>}
      <button disabled={file === null || fetching.type === 'loading'}>
        {fetching.type === 'loading' ? 'loading...' : 'load'}
      </button>
    </form>
  )
}
