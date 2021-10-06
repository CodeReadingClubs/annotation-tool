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

export type Brightness = 'light' | 'medium' | 'dark'

export function cssColorFromColor(
  color: Color,
  brightness: Brightness,
): string {
  switch (color) {
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
      const variant = variantForBrightness(brightness)
      return materialColors[color][variant]
    }
  }
}

function variantForBrightness(brightness: Brightness): 100 | 200 | 300 {
  switch (brightness) {
    case 'light': {
      return 100
    }
    case 'medium': {
      return 200
    }
    case 'dark': {
      return 300
    }
  }
}
