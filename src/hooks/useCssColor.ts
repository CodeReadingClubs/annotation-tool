import { Color, cssColorFromColor } from '../colors'
import { useSelector } from '../store'

export default function useCssColor(color: Color) {
  const brightness = useSelector((state) => state.annotationBrightness)
  return cssColorFromColor(color, brightness)
}
