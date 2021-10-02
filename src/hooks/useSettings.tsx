import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { Brightness } from '../colors'

export type Settings = {
  showStraightArrows: boolean
  annotationBrightness: Brightness
  setShowStraightArrows: (newValue: boolean) => void
  setAnnotationBrightness: (newValue: Brightness) => void
}

const SettingsContext = createContext<Settings | null>(null)

export function SettingsProvider({ children }: PropsWithChildren<{}>) {
  const [showStraightArrows, setShowStraightArrows] = useState(false)
  const [annotationBrightness, setAnnotationBrightness] =
    useState<Brightness>('medium')

  const value = useMemo(
    () => ({
      showStraightArrows,
      annotationBrightness,
      setShowStraightArrows,
      setAnnotationBrightness,
    }),
    [showStraightArrows, annotationBrightness],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): Settings {
  const settings = useContext(SettingsContext)
  if (!settings) {
    throw new Error(`Can't call useSettings() outside of a <SettingsProvider>`)
  }

  return settings
}
