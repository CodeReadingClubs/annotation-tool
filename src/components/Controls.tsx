import React, { useCallback } from 'react'
import { Brightness } from '../colors'
import { ArrowDrawingMode, useSettings } from '../hooks/useSettings'
import useSource from '../hooks/useSource'
import { localStorageKey } from '../source'
import { useDispatch } from '../store'
import { redo, reset, undo, useCanUndoRedo } from '../undoable'
import Export from './Export'

export default function Controls() {
  const dispatch = useDispatch()
  const { arrowDrawingMode, setArrowDrawingMode } = useSettings()

  return (
    <div className='annotation-controls'>
      <DrawingMode />
      <UndoManagement />
      <AnnotationBrightness />
      <Export />
      {import.meta.env.DEV && <PersistedStateDebugging />}
    </div>
  )
}

const drawingModeOptions: { title: string; value: ArrowDrawingMode }[] = [
  { title: 'Freehand', value: 'freehand' },
  { title: 'Jointed', value: 'jointed' },
]

function DrawingMode() {
  const { arrowDrawingMode, setArrowDrawingMode } = useSettings()

  return (
    <div>
      <span>Arrow drawing mode: </span>
      <RadioGroup
        name='arrow-drawing-mode'
        options={drawingModeOptions}
        selectedValue={arrowDrawingMode}
        onSelect={setArrowDrawingMode}
      />
    </div>
  )
}

const brightnessOptions: { title: string; value: Brightness }[] = [
  { title: 'Light', value: 'light' },
  { title: 'Medium', value: 'medium' },
  { title: 'Dark', value: 'dark' },
]

function AnnotationBrightness() {
  const { annotationBrightness, setAnnotationBrightness } = useSettings()

  return (
    <div>
      <span>Annotation brightness: </span>
      <RadioGroup
        name='annotation-brightness'
        options={brightnessOptions}
        selectedValue={annotationBrightness}
        onSelect={setAnnotationBrightness}
      />
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

function RadioGroup<Value extends string>({
  name,
  options,
  selectedValue,
  onSelect,
}: {
  name: string
  options: { title: string; value: Value }[]
  selectedValue: Value
  onSelect: (value: Value) => void
}) {
  return (
    <>
      {options.map(({ title, value }) => (
        <RadioItem<Value>
          key={value}
          name={name}
          title={title}
          value={value}
          selectedValue={selectedValue}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

function RadioItem<Value extends string>({
  title,
  name,
  value,
  selectedValue,
  onSelect,
}: {
  title: string
  name: string
  value: Value
  selectedValue: Value
  onSelect: (value: Value) => void
}) {
  const id = `${name}--${value}`
  return (
    <>
      <input
        type='radio'
        name={name}
        id={id}
        value={value}
        checked={value === selectedValue}
        onChange={(event) => onSelect(event.target.value as Value)}
      />
      <label htmlFor={id}>{title}</label>
    </>
  )
}
