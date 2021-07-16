import React, { PropsWithChildren } from 'react'
import { Marker } from './App'
import { Selection } from './useSelection'

type Props = PropsWithChildren<{
  rect: Selection | Marker
  onBlur?: () => void
}>

export function Popover({ rect, children, onBlur }: Props) {
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
      style={{
        position: 'absolute',
        top: rect.top + rect.height,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        outline: 'none',
      }}
    >
      {children}
    </div>
  )
}
