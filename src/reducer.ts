import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'
import { Arrow, Marker, Point, Rect } from './types'

export type State = {
  code: string | null
  currentSelection: Selection | null
  markers: Marker[]
  arrows: Arrow[]
  lineAnnotations: Record<number, Record<string, boolean>>
  colors: string[]
  showStraightArrows: boolean
}

type Selection =
  | { type: 'text'; rect: Rect }
  | { type: 'marker'; marker: Marker }
  | { type: 'arrow'; arrow: Arrow; point: Point }

const initialState: State = {
  code: null,
  currentSelection: null,
  markers: [],
  arrows: [],
  lineAnnotations: {},
  colors: ['lightblue', 'lightgreen', 'gold', 'pink'],
  showStraightArrows: false,
}

const { reducer, actions } = createSlice({
  name: 'state',
  initialState,
  reducers: {
    setCode(state, action: PayloadAction<string>) {
      state.code = action.payload
    },
    selectText(state, action: PayloadAction<Rect>) {
      state.currentSelection = { type: 'text', rect: action.payload }
    },
    selectMarker(state, action: PayloadAction<Marker>) {
      state.currentSelection = { type: 'marker', marker: action.payload }
    },
    selectArrow(state, action: PayloadAction<{ arrow: Arrow; point: Point }>) {
      state.currentSelection = { type: 'arrow', ...action.payload }
    },
    clearSelection(state) {
      state.currentSelection = null
    },
    removeMarker(state, action: PayloadAction<Marker>) {
      state.markers = state.markers.filter(
        (marker) => marker.id !== action.payload.id,
      )
      state.arrows = removeArrowsWithDependency(state.arrows, action.payload.id)
      state.currentSelection = null
    },
    removeArrow(state, action: PayloadAction<Arrow>) {
      state.arrows = removeArrowsWithDependency(state.arrows, action.payload.id)
      state.currentSelection = null
    },
    addMarker(state, action: PayloadAction<{ rect: Rect; color: string }>) {
      if (state.currentSelection?.type === 'text') {
        document.getSelection()?.removeAllRanges()
      }
      state.markers.push({
        ...action.payload.rect,
        color: action.payload.color,
        id: uuid(),
      })
      state.currentSelection = null
    },
    addArrow(state, action: PayloadAction<Arrow>) {
      state.arrows.push(action.payload)
    },
    setMarkerColor(
      state,
      action: PayloadAction<{ marker: Marker; color: string }>,
    ) {
      const marker = state.markers.find(
        ({ id }) => id === action.payload.marker.id,
      )
      if (!marker) {
        return
      }
      marker.color = action.payload.color
      state.currentSelection = null
    },
    setArrowColor(
      state,
      action: PayloadAction<{ arrow: Arrow; color: string }>,
    ) {
      const arrow = state.arrows.find(
        ({ id }) => id === action.payload.arrow.id,
      )
      if (!arrow) {
        return
      }
      arrow.color = action.payload.color
      state.currentSelection = null
    },
    toggleLineAnnotation(
      state,
      {
        payload: { lineNumber, color },
      }: PayloadAction<{ lineNumber: number; color: string }>,
    ) {
      const selectedColors = state.lineAnnotations[lineNumber] ?? {}
      selectedColors[color] = !(selectedColors[color] ?? false)
      state.lineAnnotations[lineNumber] = selectedColors
    },
    setShowStraightArrows(state, action: PayloadAction<boolean>) {
      state.showStraightArrows = action.payload
    },
  },
})

function removeArrowsWithDependency(arrows: Arrow[], id: string): Arrow[] {
  return arrows.filter(
    (arrow) => !(id in arrow.dependencies) && arrow.id !== id,
  )
}

export default reducer
export const {
  setCode,
  selectText,
  addMarker,
  selectMarker,
  removeMarker,
  addArrow,
  selectArrow,
  removeArrow,
  setMarkerColor,
  setArrowColor,
  clearSelection,
  toggleLineAnnotation,
  setShowStraightArrows,
} = actions

const undoableActions: Set<string> = new Set([
  addMarker.type,
  removeMarker.type,
  addArrow.type,
  removeArrow.type,
  toggleLineAnnotation.type,
  setMarkerColor.type,
  setArrowColor.type,
])

export function isUndoableAction(action: AnyAction): boolean {
  return undoableActions.has(action.type)
}

export const emptyAnnotations: Pick<
  State,
  'markers' | 'arrows' | 'lineAnnotations'
> = {
  markers: [],
  arrows: [],
  lineAnnotations: {},
}

export function undoableSlice({
  markers,
  arrows,
  lineAnnotations,
  colors,
}: State) {
  return { markers, arrows, lineAnnotations, colors }
}
