import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import {
  TypedUseSelectorHook,
  useDispatch as ogUseDispatch,
  useSelector as ogUseSelector,
} from 'react-redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import reducer, {
  emptyAnnotations,
  isUndoableAction,
  State,
  undoableSlice,
} from './reducer'
import { localStorageKey, Source } from './source'
import undoable from './undoable'

const undoableReducer = undoable(
  reducer,
  undoableSlice,
  isUndoableAction,
  emptyAnnotations,
)

const middleware = getDefaultMiddleware({ serializableCheck: false })

export default function createStore(source: Source) {
  const persistConfig = {
    key: `state:${localStorageKey(source)}`,
    version: 0,
    storage,
    whitelist: ['markers', 'arrows', 'lineAnnotations'],
  }
  const undoablePersistedReducer = persistReducer(
    persistConfig,
    undoableReducer,
  )
  const store = configureStore({
    reducer: undoablePersistedReducer,
    middleware,
  })

  const persistor = persistStore(store)

  return { store, persistor }
}

export type AppDispatch = ReturnType<typeof createStore>['store']['dispatch']

export const useDispatch = () => ogUseDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<State> = ogUseSelector
