import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'
import { Color, colors } from './colors'
import { Arrow, Marker, Point, TextSelection } from './types'

export type State = {
  currentSelection: Selection | null
  markers: Record<string, Marker>
  arrows: Record<string, Arrow>
  lineAnnotations: Record<number, Record<Color, boolean>>
  colors: Color[]
}

type Selection =
  | { type: 'text'; textSelection: TextSelection }
  | { type: 'marker'; marker: Marker }
  | { type: 'arrow'; arrow: Arrow; point: Point }

const initialState: State = {
  currentSelection: null,
  markers: {},
  arrows: {},
  lineAnnotations: {},
  colors: colors as unknown as Color[],
}

const { reducer, actions } = createSlice({
  name: 'state',
  initialState,
  reducers: {
    selectText(state, action: PayloadAction<TextSelection>) {
      state.currentSelection = { type: 'text', textSelection: action.payload }
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
      delete state.markers[action.payload.id]
      const idsToDelete = []
      for (const arrow of Object.values(state.arrows)) {
        if (arrow.dependencies[action.payload.id]) {
          idsToDelete.push(arrow.id)
        }
      }
      idsToDelete.forEach((id) => delete state.arrows[id])
      state.currentSelection = null
    },
    removeArrow(state, action: PayloadAction<Arrow>) {
      const idsToDelete = []
      for (const arrow of Object.values(state.arrows)) {
        if (
          arrow.dependencies[action.payload.id] ||
          arrow.id === action.payload.id
        ) {
          idsToDelete.push(arrow.id)
        }
      }
      idsToDelete.forEach((id) => delete state.arrows[id])
      state.currentSelection = null
    },
    addMarker(
      state,
      action: PayloadAction<{ textSelection: TextSelection; color: Color }>,
    ) {
      if (state.currentSelection?.type === 'text') {
        document.getSelection()?.removeAllRanges()
      }
      const id = uuid()
      state.markers[id] = {
        ...action.payload.textSelection,
        color: action.payload.color,
        id,
      }
      state.currentSelection = null
    },
    addArrow(state, action: PayloadAction<Arrow>) {
      state.arrows[action.payload.id] = action.payload
    },
    setMarkerColor(
      state,
      action: PayloadAction<{ marker: Marker; color: Color }>,
    ) {
      const marker = state.markers[action.payload.marker.id]
      if (!marker) {
        return
      }
      marker.color = action.payload.color
      state.currentSelection = null
    },
    setArrowColor(
      state,
      action: PayloadAction<{ arrow: Arrow; color: Color }>,
    ) {
      const arrow = state.arrows[action.payload.arrow.id]
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
      }: PayloadAction<{ lineNumber: number; color: Color }>,
    ) {
      const selectedColors = state.lineAnnotations[lineNumber] ?? {}
      selectedColors[color] = !(selectedColors[color] ?? false)
      state.lineAnnotations[lineNumber] = selectedColors
    },
  },
})

export default reducer
export const {
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
  markers: {},
  arrows: {},
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
