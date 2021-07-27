import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import * as github from '../github'

export default function SourceSelectionPage() {
  const [url, setUrl] = useState('')
  const file = github.parsePath(url)
  const history = useHistory()

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!file) {
        return
      }
      history.push(`/file/${github.fileHash(file)}`)
    },
    [url],
  )

  const onType = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }, [])

  return (
    <form onSubmit={onSubmit}>
      <input value={url} onChange={onType} />
      {url !== '' && file === null && (
        <p role='alert'>that's not a github file url</p>
      )}
      <button disabled={file === null}>Annotate</button>
    </form>
  )
}
