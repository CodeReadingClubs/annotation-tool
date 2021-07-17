import { configureStore } from '@reduxjs/toolkit'
import {
  TypedUseSelectorHook,
  useDispatch as ogUseDispatch,
  useSelector as ogUseSelector,
} from 'react-redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import reducer, { isUndoableAction, State, undoableSlice } from './reducer'
import undoable from './undoable'

const persistConfig = {
  key: 'state',
  storage,
  blacklist: ['past', 'future'],
}

const undoableReducer = undoable(reducer, undoableSlice, isUndoableAction)
const undoablePersistedReducer = persistReducer(persistConfig, undoableReducer)
const store = configureStore({
  reducer: undoablePersistedReducer,
})

export default store

export const persistor = persistStore(store)

export type AppDispatch = typeof store.dispatch

export const useDispatch = () => ogUseDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<State> = ogUseSelector
