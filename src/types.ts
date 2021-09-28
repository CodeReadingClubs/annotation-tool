import { Color } from './colors'

export type Point = { x: number; y: number }

export type Rect = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

export type Selection = Rect & {
  id: string
}

export type Marker = Selection & {
  color: Color
}

export type UnfinishedArrow = {
  fromPoint: Point
  fromMarker: string
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker | null
  color?: Color
  dependencies: Record<string, boolean>
}

export type Arrow = {
  fromPoint: Point
  fromMarker: string
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker
  color?: Color
  id: string
  dependencies: Record<string, boolean>
}
