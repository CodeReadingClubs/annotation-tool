import React, { Fragment } from 'react'
import { shallowEqual } from 'react-redux'
import { Color } from '../colors'
import useCssColor from '../hooks/useCssColor'
import { toggleLineAnnotation } from '../reducer'
import { useDispatch, useSelector } from '../store'

export default function Code() {
  const dispatch = useDispatch()
  const { code, annotations } = useSelector(
    (state) => ({
      code: state.code,
      annotations: state.lineAnnotations,
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

const annotationColors: Color[] = ['pink', 'blue', 'green']

function Annotations({
  annotations,
  toggleAnnotation,
}: {
  annotations: Record<string, boolean>
  toggleAnnotation: (color: Color) => void
}) {
  return (
    <div className='line-annotations'>
      {annotationColors.map((color) => (
        <AnnotationButton
          key={color}
          color={color}
          annotations={annotations}
          toggleAnnotation={toggleAnnotation}
        />
      ))}
    </div>
  )
}

function AnnotationButton({
  color,
  annotations,
  toggleAnnotation,
}: {
  color: Color
  annotations: Record<string, boolean>
  toggleAnnotation: (color: Color) => void
}) {
  const cssColor = useCssColor(color)

  return (
    <button
      key={color}
      onClick={() => toggleAnnotation(color)}
      className={`color-button ${
        annotations[color] ? 'color-button--active' : ''
      }`}
      style={{ '--color': cssColor } as React.CSSProperties}
    ></button>
  )
}
