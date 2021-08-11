import materialColors from 'material-colors-ts'
import { ArrayElement } from './util'

export const colors = [
  'pink',
  'purple',
  'deepPurple',
  'indigo',
  'blue',
  'lightBlue',
  'cyan',
  'teal',
  'green',
  'lightGreen',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deepOrange',
  'red',
] as const

export type Color = ArrayElement<typeof colors>

function cssColorFromColor(
  color: Color | 'lightblue' | 'lightgreen' | 'gold',
): string {
  switch (color) {
    case 'lightblue':
    case 'lightgreen':
    case 'gold': {
      return color
    }
    case 'pink':
    case 'purple':
    case 'deepPurple':
    case 'indigo':
    case 'blue':
    case 'lightBlue':
    case 'cyan':
    case 'teal':
    case 'green':
    case 'lightGreen':
    case 'lime':
    case 'yellow':
    case 'amber':
    case 'orange':
    case 'deepOrange':
    case 'red': {
      return materialColors[color][200]
    }
  }
}

// in the future this would allow more customization such as light/dark themes
export function useCssColor(color: Color) {
  return cssColorFromColor(color)
}
