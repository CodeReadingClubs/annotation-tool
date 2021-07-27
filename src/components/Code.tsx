import React, { Fragment } from 'react'
import { shallowEqual } from 'react-redux'
import { toggleLineAnnotation } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function Code() {
  const dispatch = useDispatch()
  const { code, annotations, colors } = useSelector(
    (state) => ({
      code: state.code,
      annotations: state.lineAnnotations,
      colors: state.colors,
    }),
    shallowEqual,
  )
  if (!code) {
    return <div>Loading code...</div>
  }
  const lines = code.split('\n')

  return (
    <div className='code-container'>
      {lines.map((line, index) => (
        <Fragment key={index}>
          <Annotations
            colors={colors}
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
  colors,
  annotations,
  toggleAnnotation,
}: {
  colors: string[]
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
