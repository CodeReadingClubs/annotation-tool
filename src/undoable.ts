import { AnyAction, createAction, Reducer } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

type StateWrapper<State extends StateSlice, StateSlice> = State & {
  past: StateSlice[]
  future: StateSlice[]
}
type ActionWrapper<Action> =
  | Action
  | ReturnType<typeof undo>
  | ReturnType<typeof redo>

export const undo = createAction('undoable/undo')
export const redo = createAction('undoable/redo')

export default function undoable<
  State extends StateSlice,
  Action extends AnyAction,
  StateSlice,
>(
  reducer: Reducer<State, Action>,
  slice: (state: State) => StateSlice,
  shouldLogAction: (action: Action) => boolean,
): Reducer<StateWrapper<State, StateSlice>, ActionWrapper<Action>> {
  return (state, action) => {
    if (!state) {
      const initialState = reducer(undefined, action as Action)
      return { ...initialState, past: [], future: [] }
    }
    switch (action.type) {
      case undo.type: {
        const { past, future, ...currentState } = state
        const newState = past[0]
        if (!newState) {
          return state
        }
        return {
          ...state,
          ...newState,
          past: past.slice(1),
          future: [slice(currentState as unknown as State), ...future],
        }
      }
      case redo.type: {
        const { past, future, ...currentState } = state
        const newState = future[0]
        if (!newState) {
          return state
        }
        return {
          ...state,
          ...newState,
          past: [slice(currentState as unknown as State), ...past],
          future: future.slice(1),
        }
      }
      default: {
        const { past, future, ...currentState } = state
        const newState = reducer(
          currentState as unknown as State,
          action as Action,
        )
        const newPast = shouldLogAction(action as Action)
          ? [slice(currentState as unknown as State), ...past]
          : past
        return {
          ...newState,
          past: newPast,
          future: [],
        }
      }
    }
  }
}

export function useCanUndoRedo<State extends StateSlice, StateSlice>(): {
  canUndo: boolean
  canRedo: boolean
} {
  const canUndo = useSelector(
    (state: StateWrapper<State, StateSlice>) => state.past.length > 0,
  )
  const canRedo = useSelector(
    (state: StateWrapper<State, StateSlice>) => state.future.length > 0,
  )

  return { canUndo, canRedo }
}
