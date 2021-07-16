import React, { Fragment } from 'react'

export default function Code({ code }: { code: string }) {
  const lines = code.split('\n')

  return (
    <div className='code-container'>
      {lines.map((line, index) => (
        <Fragment key={index}>
          <span className='line-number'>{index + 1}</span>
          <pre className='code-line'>{line}</pre>
        </Fragment>
      ))}
    </div>
  )
}
