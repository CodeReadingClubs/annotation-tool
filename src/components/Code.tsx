import React, { Fragment } from 'react'
import { Color } from '../colors'
import useCssColor from '../hooks/useCssColor'
import { toggleLineAnnotation } from '../reducer'
import { useDispatch, useSelector } from '../store'
import CodeAnnotations from './CodeAnnotations'

export default function Code() {
  const lines = useSelector((state) => state.code?.split('\n'))
  if (!lines) {
    return <div>Loading code...</div>
  }

  return (
    <div className='code-container'>
      {lines.map((line, index) => (
        <Line key={index} lineNumber={index + 1} line={line} />
      ))}
      <CodeAnnotations />
    </div>
  )
}

function Line({ lineNumber, line }: { lineNumber: number; line: string }) {
  const dispatch = useDispatch()
  const annotations = useSelector(
    (state) => state.lineAnnotations[lineNumber] ?? {},
  )
  return (
    <Fragment key={lineNumber}>
      <Annotations
        annotations={annotations}
        toggleAnnotation={(color) =>
          dispatch(toggleLineAnnotation({ lineNumber, color }))
        }
      />
      <span className='line-number' style={{ gridRow: lineNumber }}>
        {lineNumber}
      </span>
      <pre className='code-line' style={{ gridRow: lineNumber }}>
        {line}
      </pre>
    </Fragment>
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
