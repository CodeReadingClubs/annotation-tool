import React, { Fragment } from 'react'
import colors from '../colors'
import { toggleLineAnnotation } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function Code() {
  const dispatch = useDispatch()
  const { code, annotations } = useSelector((state) => ({
    code: state.code,
    annotations: state.lineAnnotations,
  }))
  const lines = code.split('\n')

  return (
    <div className='code-container'>
      {lines.map((line, index) => (
        <Fragment key={index}>
          <Annotations
            annotations={annotations[index + 1] ?? {}}
            toggleAnnotation={(color) =>
              dispatch(toggleLineAnnotation({ lineNumber: index + 1, color }))
            }
          />
          <span className='line-number'>{index + 1}</span>
          <pre className='code-line'>{line}</pre>
        </Fragment>
      ))}
    </div>
  )
}

function Annotations({
  annotations,
  toggleAnnotation,
}: {
  annotations: Record<string, boolean>
  toggleAnnotation: (color: string) => void
}) {
  return (
    <div className='line-annotations'>
      {colors.slice(0, 3).map((color) => (
        <button
          key={color}
          onClick={() => toggleAnnotation(color)}
          className={`color-button ${
            annotations[color] ? 'color-button--active' : ''
          }`}
          style={{ '--color': color } as React.CSSProperties}
        ></button>
      ))}
    </div>
  )
}
