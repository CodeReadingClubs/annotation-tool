import React, { PropsWithChildren } from 'react'
import { Point } from '../types'

type Props = PropsWithChildren<{
  origin: Point
  onBlur?: () => void
}>

export function Popover({ origin, onBlur, children }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (onBlur) {
      ref.current?.focus()
    }
  }, [])

  return (
    <div
      ref={ref}
      onBlur={onBlur}
      tabIndex={1}
      className='popover'
      style={
        {
          '--top': `${origin.y}px`,
          '--left': `${origin.x}px`,
          '--transform': 'translateX(-50%)',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
