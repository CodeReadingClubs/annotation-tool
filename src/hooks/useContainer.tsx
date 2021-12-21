import React from 'react'
import { Point } from '../types'
import { pointFromEvent } from '../util'

const ContainerContext = React.createContext<
  React.MutableRefObject<HTMLDivElement | null> | undefined
>(undefined)
ContainerContext.displayName = 'ContainerContext'

export function ContainerDiv(
  props: Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    'ref'
  >,
) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  return (
    <ContainerContext.Provider value={ref}>
      <div {...props} ref={ref} />
    </ContainerContext.Provider>
  )
}

export function useContainer(): {
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  eventCoordinates: (event: React.MouseEvent) => Point
} {
  const ref = React.useContext(ContainerContext)
  if (!ref) {
    throw new Error(`Tried to call useContainer outside of a <ContainerDiv>`)
  }

  const eventCoordinates = React.useCallback(
    (event: React.MouseEvent) => pointFromEvent(event, ref.current!),
    [],
  )

  return { containerRef: ref, eventCoordinates }
}
