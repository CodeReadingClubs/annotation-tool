import React, { useCallback } from 'react'
import { Brightness } from '../colors'
import { useSettings } from '../hooks/useSettings'
import useSource from '../hooks/useSource'
import { localStorageKey } from '../source'
import { useDispatch } from '../store'
import { redo, reset, undo, useCanUndoRedo } from '../undoable'
import Export from './Export'

export default function Controls() {
  const dispatch = useDispatch()
  const { showStraightArrows, setShowStraightArrows } = useSettings()

  return (
    <div className='annotation-controls'>
      <input
        type='checkbox'
        id='straight-arrows'
        checked={showStraightArrows}
        onChange={(e) => setShowStraightArrows(e.target.checked)}
      />
      <label htmlFor='straight-arrows'>Use straight arrows</label>
      <UndoManagement />
      <AnnotationBrightness />
      <Export />
      {import.meta.env.DEV && <PersistedStateDebugging />}
    </div>
  )
}

function AnnotationBrightness() {
  const { annotationBrightness: brightness, setAnnotationBrightness } =
    useSettings()

  function RadioItem({ value, title }: { value: Brightness; title: string }) {
    const id = `annotation-brightness--${value}`
    return (
      <>
        <input
          type='radio'
          name='annotation-brightness'
          id={id}
          value={value}
          checked={brightness === value}
          onChange={(event) =>
            setAnnotationBrightness(event.target.value as Brightness)
          }
        />
        <label htmlFor={id}>{title}</label>
      </>
    )
  }

  const radios: [Brightness, string][] = [
    ['light', 'Light'],
    ['medium', 'Medium'],
    ['dark', 'Dark'],
  ]

  return (
    <div>
      <span>Annotation brightness: </span>
      {radios.map(([value, title]) => (
        <RadioItem value={value} title={title} key={value} />
      ))}
    </div>
  )
}

function UndoManagement() {
  const dispatch = useDispatch()
  const { canUndo, canRedo } = useCanUndoRedo()

  return (
    <div>
      <button disabled={!canUndo} onClick={() => dispatch(undo())}>
        undo
      </button>
      <button disabled={!canRedo} onClick={() => dispatch(redo())}>
        redo
      </button>
      <button onClick={() => dispatch(reset())}>clear</button>
    </div>
  )
}

function PersistedStateDebugging() {
  const source = useSource()
  const paste = useCallback(() => {
    const key = `persist:state:${localStorageKey(source)}`
    navigator.clipboard
      .readText()
      .then((text) => localStorage.setItem(key, text))
      .then(() => console.log('pasted'))
  }, [])

  const copy = useCallback(() => {
    const key = `persist:state:${localStorageKey(source)}`
    const localStorageValue = localStorage.getItem(key)
    if (!localStorageValue) {
      console.error(`Value missing in local storage`)
      return
    }
    navigator.clipboard
      .writeText(localStorageValue)
      .then(() => console.log('copied'))
  }, [])

  return (
    <div>
      <button onClick={copy}>copy persisted state</button>
      <button onClick={paste}>paste persisted state</button>
    </div>
  )
}
