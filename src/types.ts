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
  color: string
}

export type UnfinishedLine = {
  fromPoint: Point
  fromMarker: Marker
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker | null
}

export type Line = {
  fromPoint: Point
  fromMarker: Marker
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker
  id: string
}
