import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'
import { Arrow, Marker, Point, Rect } from './types'

const code = `function configFromInput(config) {
  var input = config._i;
  if (isUndefined(input)) {
      config._d = new Date(hooks.now());
  } else if (isDate(input)) {
      config._d = new Date(input.valueOf());
  } else if (typeof input === 'string') {
      configFromString(config);
  } else if (isArray(input)) {
      config._a = map(input.slice(0), function (obj) {
          return parseInt(obj, 10);
      });
      configFromArray(config);
  } else if (isObject(input)) {
      configFromObject(config);
  } else if (isNumber(input)) {
      // from milliseconds
      config._d = new Date(input);
  } else {
      hooks.createFromInputFallback(config);
  }
}
`

export type State = {
  code: string
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
  code,
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
      if (state.currentSelection?.type === 'text') {
        document.getSelection()?.removeAllRanges()
      }
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
