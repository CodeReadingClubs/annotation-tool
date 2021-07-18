import React, { useEffect } from 'react'
import useKeyboardUndoHandler from '../hooks/useKeyboardUndoHandler'
import Code from './Code'
import Controls from './Controls'
import SelectionPopover from './SelectionPopover'
import Svg from './Svg'

export default function AnnotationPage() {
  const handler = useKeyboardUndoHandler()
  useEffect(() => {
    document.onkeydown = handler
  }, [handler])

  return (
    <div>
      <Controls />
      <div className='container'>
        <Code />
        <Svg />
        <SelectionPopover />
      </div>
    </div>
  )
}
