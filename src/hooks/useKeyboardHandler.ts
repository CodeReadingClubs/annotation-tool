import React from 'react'

// with a little help from https://stackoverflow.com/a/57926311
export default function useKeyboardHandler(
  handler: (event: KeyboardEvent) => void,
) {
  const handlerRef = React.useRef(handler)

  React.useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  React.useEffect(() => {
    const eventListener = (event: KeyboardEvent) => handlerRef.current(event)
    document.addEventListener('keydown', eventListener)

    return () => {
      document.removeEventListener('keydown', eventListener)
    }
  }, [])
}
