import React from 'react'
import { setShowStraightArrows } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function Settings() {
  const dispatch = useDispatch()
  const showStraightArrows = useSelector((state) => state.showStraightArrows)

  return (
    <div>
      <input
        type='checkbox'
        id='straight-arrows'
        checked={showStraightArrows}
        onChange={(e) => dispatch(setShowStraightArrows(e.target.checked))}
      />
      <label htmlFor='straight-arrows'>Use straight arrows</label>
    </div>
  )
}
