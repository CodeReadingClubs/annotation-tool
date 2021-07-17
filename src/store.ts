import { configureStore } from '@reduxjs/toolkit'
import {
  TypedUseSelectorHook,
  useDispatch as ogUseDispatch,
  useSelector as ogUseSelector,
} from 'react-redux'
import reducer, { isUndoableAction, State, undoableSlice } from './reducer'
import undoable from './undoable'

const wrappedReducer = undoable(reducer, undoableSlice, isUndoableAction)
const store = configureStore({
  reducer: wrappedReducer,
})

export default store

export type AppDispatch = typeof store.dispatch

export const useDispatch = () => ogUseDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<State> = ogUseSelector
