import React, { PropsWithChildren } from 'react'
import { clearSelection } from '../reducer'
import { useDispatch } from '../store'
import { Point } from '../types'

type Props = PropsWithChildren<{
  origin: Point
  autofocus?: boolean
  className?: string
}>

export function Popover({
  origin,
  autofocus = false,
  children,
  className,
}: Props) {
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
      className={`popover ${className ?? ''}`}
      style={
        {
          '--top': `${Math.round(origin.y)}px`,
          '--left': `${Math.round(origin.x)}px`,
          '--transform': 'translateX(-50%)',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}
