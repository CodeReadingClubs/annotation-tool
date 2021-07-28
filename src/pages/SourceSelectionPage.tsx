import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import * as github from '../github'

export default function SourceSelectionPage() {
  return (
    <div>
      <h1>Code Annotation Tool</h1>
      <p>
        Use this to annotate code in{' '}
        <a href='https://code-reading.org'>Code Reading Clubs</a>.
      </p>
      <p>
        To use it, open the desired file on GitHub, press <code>Y</code> (this
        changes the url to a permalink) and copy the url. It should look
        something like this:
      </p>
      <code>
        https://github.com/owner/repo/blob/908de054006934a071f770906119ce6d35a5a612/some/file/path.ext
      </code>
      <p>Paste it below:</p>
      <Form />
    </div>
  )
}

function Form() {
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
    <form className='file-form' onSubmit={onSubmit}>
      <input
        aria-label='github file url'
        value={url}
        onChange={onType}
        placeholder='https://github.com/owner/repo/blob/908de054006934a071f770906119ce6d35a5a612/some/file/path.ext'
      />
      <button disabled={file === null}>Annotate</button>
      {url !== '' && file === null && (
        <p role='alert'>That's not a GitHub file url</p>
      )}
    </form>
  )
}
