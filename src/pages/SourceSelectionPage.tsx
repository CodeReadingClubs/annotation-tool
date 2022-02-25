import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import * as github from '../github'
import { Source, sourceHash } from '../source'
import { Footer } from './../components/Footer'

export default function SourceSelectionPage() {
  return (
    <div className='home-page'>
      <main>
        <h1>Code Annotation Tool</h1>
        <ol>
          <li>Find a file you want to annotate on Github</li>
          <li>
            <strong>
              Press <kbd>Y</kbd>
            </strong>{' '}
            (this will change the url to a permalink)
          </li>
          <li>Copy the url</li>
          <li>Paste it below</li>
        </ol>
        <Form />
      </main>
      <Footer />
    </div>
  )
}

function Form() {
  const [url, setUrl] = useState('')
  const urlParseResult = github.parsePath(url)
  const history = useHistory()

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (urlParseResult.type !== 'success') {
        return
      }
      const source: Source = {
        type: 'githubPermalink',
        file: urlParseResult.file,
      }
      history.push(`/file/${sourceHash(source)}`)
    },
    [url],
  )

  const onType = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }, [])

  return (
    <form className='file-form' onSubmit={onSubmit}>
      <div className='file-form__input-row'>
        <input
          aria-label='github file url'
          value={url}
          onChange={onType}
          placeholder='https://github.com/owner/repo/blob/908de054006934a071f770906119ce6d35a5a612/some/file/path.ext'
        />
        <button disabled={urlParseResult.type === 'failure'}>Annotate</button>
      </div>
      {url !== '' && urlParseResult.type === 'failure' && (
        <ErrorMessage error={urlParseResult.error} />
      )}
    </form>
  )
}

function ErrorMessage({ error }: { error: github.ParseError }) {
  switch (error.type) {
    case 'notGithubUrl': {
      return <p role='alert'>Please provide a permalink to a GitHub file.</p>
    }
    case 'notGithubPermalink': {
      return (
        <div role='alert'>
          <p>
            <strong>That's not a GitHub permalink</strong>.
          </p>
          <p>
            You can get a permalink for a file on GitHub by pressing{' '}
            <kbd>Y</kbd> on your keyboard:
          </p>
          <div className='permalink-diagram'>
            <span
              aria-label='an example of a github url'
              className='trimmable-url'
            >
              https://github.com/CodeReadingClubs/annotation-tool/blob/main/src/pages/AnnotationPage.tsx
            </span>
            <span>↓</span>
            <span>
              <strong>
                Press <kbd>Y</kbd>
              </strong>
            </span>
            <span>↓</span>
            <span>The url will change</span>
            <span>↓</span>
            <span
              aria-label='an example of a github permalink'
              className='trimmable-url'
            >
              https://github.com/CodeReadingClubs/annotation-tool/blob/13de8c73ea369966d3e0843b0392ffb67d1015a4/src/pages/AnnotationPage.tsx
            </span>
            <span>↓</span>
            <span>Copy it and paste it here</span>
          </div>
        </div>
      )
    }
  }
}
