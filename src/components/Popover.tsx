import React, { PropsWithChildren } from 'react'
import { clearSelection } from '../reducer'
import { useDispatch } from '../store'
import { Point } from '../types'

type Props = PropsWithChildren<{
  origin: Point
  autofocus?: boolean
}>

export function Popover({ origin, autofocus = false, children }: Props) {
  const dispatch = useDispatch()
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    if (autofocus) {
      ref.current?.focus()
    }
  }, [autofocus])

  return (
    <div
      ref={ref}
      onBlur={autofocus ? () => dispatch(clearSelection()) : undefined}
      onMouseDown={autofocus ? (event) => event.preventDefault() : undefined}
      tabIndex={autofocus ? 1 : undefined}
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
