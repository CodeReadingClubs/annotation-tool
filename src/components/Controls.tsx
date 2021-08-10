import React, { useCallback } from 'react'
import { useFilePath } from '../hooks/useFile'
import { setShowStraightArrows } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { redo, reset, undo, useCanUndoRedo } from '../undoable'
import Export from './Export'

export default function Controls() {
  const dispatch = useDispatch()
  const showStraightArrows = useSelector((state) => state.showStraightArrows)

  return (
    <div className='annotation-controls'>
      <input
        type='checkbox'
        id='straight-arrows'
        checked={showStraightArrows}
        onChange={(e) => dispatch(setShowStraightArrows(e.target.checked))}
      />
      <label htmlFor='straight-arrows'>Use straight arrows</label>
      <UndoManagement />
      <Export />
      {import.meta.env.DEV && <PersistedStateDebugging />}
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
  const filePath = useFilePath()
  const paste = useCallback(() => {
    const key = `persist:state:${filePath}`
    navigator.clipboard
      .readText()
      .then((text) => localStorage.setItem(key, text))
      .then(() => console.log('pasted'))
  }, [])

  const copy = useCallback(() => {
    const key = `persist:state:${filePath}`
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
