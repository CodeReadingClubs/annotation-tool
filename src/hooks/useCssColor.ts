import { Color, cssColorFromColor } from '../colors'
import { useSettings } from './useSettings'

export default function useCssColor(color: Color) {
  const { annotationBrightness } = useSettings()
  return cssColorFromColor(color, annotationBrightness)
}
