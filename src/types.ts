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

export type UnfinishedArrow = {
  fromPoint: Point
  fromMarker: Marker
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker | null
  arrowDependencies: Set<string>
}

export type Arrow = {
  fromPoint: Point
  fromMarker: Marker
  midPoints: Point[]
  toPoint: Point
  toMarker: Marker
  id: string
  arrowDependencies: Set<string>
}
