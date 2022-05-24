import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'
import { Brightness } from '../colors'

export type ArrowDrawingMode = 'jointed' | 'freehand'

export type Settings = {
  arrowDrawingMode: ArrowDrawingMode
  annotationBrightness: Brightness
  setArrowDrawingMode: (drawingMode: ArrowDrawingMode) => void
  setAnnotationBrightness: (newValue: Brightness) => void
}

const SettingsContext = createContext<Settings | null>(null)

export function SettingsProvider({ children }: PropsWithChildren<{}>) {
  const [arrowDrawingMode, setArrowDrawingMode] =
    useState<ArrowDrawingMode>('freehand')
  const [annotationBrightness, setAnnotationBrightness] =
    useState<Brightness>('medium')

  const value = useMemo(
    () => ({
      arrowDrawingMode,
      annotationBrightness,
      setArrowDrawingMode,
      setAnnotationBrightness,
    }),
    [arrowDrawingMode, annotationBrightness],
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
