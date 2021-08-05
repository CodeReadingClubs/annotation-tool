import React from 'react'
import { setShowStraightArrows } from '../reducer'
import { useDispatch, useSelector } from '../store'
import { redo, reset, undo, useCanUndoRedo } from '../undoable'
import Export from './Export'

export default function Controls() {
  const dispatch = useDispatch()
  const showStraightArrows = useSelector((state) => state.showStraightArrows)
  const { canUndo, canRedo } = useCanUndoRedo()

  return (
    <div className='annotation-controls'>
      <input
        type='checkbox'
        id='straight-arrows'
        checked={showStraightArrows}
        onChange={(e) => dispatch(setShowStraightArrows(e.target.checked))}
      />
      <label htmlFor='straight-arrows'>Use straight arrows</label>
      <div>
        <button disabled={!canUndo} onClick={() => dispatch(undo())}>
          undo
        </button>
        <button disabled={!canRedo} onClick={() => dispatch(redo())}>
          redo
        </button>
        <button onClick={() => dispatch(reset())}>clear</button>
      </div>
      <Export />
    </div>
  )
}
