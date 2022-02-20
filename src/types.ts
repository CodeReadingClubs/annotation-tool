import { Color } from './colors'
import { ArrowDrawingMode } from './hooks/useSettings'

export type Point = { x: number; y: number }

export type Rect = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

export type TextRange = {
  lineNumber: number
  startOffset: number
  endOffset: number
  text: string
}

export type TextSelection = Rect & TextRange

export type Marker = TextSelection & {
  color: Color
  id: string
}

export type UnfinishedArrow = {
  drawingMode: ArrowDrawingMode
  fromPoint: Point
  fromMarker: string
  fromArrow: string | null
  midPoints: Point[]
  toPoint: Point
  toMarker: string | null
  color?: Color
  dependencies: Record<string, boolean>
}

export type Arrow = {
  fromPoint: Point
  fromMarker: string
  midPoints: Point[]
  toPoint: Point
  toMarker: string
  color?: Color
  id: string
  dependencies: Record<string, boolean>
}
