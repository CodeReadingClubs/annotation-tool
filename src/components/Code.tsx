import React, { Fragment } from 'react'
import colors from '../colors'

type Props = {
  code: string
  annotations: Map<number, Set<string>>
  toggleAnnotation: (lineNumber: number, color: string) => void
}

export default function Code({ code, annotations, toggleAnnotation }: Props) {
  const lines = code.split('\n')

  return (
    <div className='code-container'>
      {lines.map((line, index) => (
        <Fragment key={index}>
          <Annotations
            annotations={annotations.get(index + 1) ?? new Set()}
            toggleAnnotation={(color) => toggleAnnotation(index + 1, color)}
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
  annotations: Set<string>
  toggleAnnotation: (color: string) => void
}) {
  return (
    <div className='line-annotations'>
      {colors.slice(0, 3).map((color) => (
        <button
          onClick={() => toggleAnnotation(color)}
          className={`color-button ${
            annotations.has(color) ? 'color-button--active' : ''
          }`}
          style={{ '--color': color } as React.CSSProperties}
        ></button>
      ))}
    </div>
  )
}
