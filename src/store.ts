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
import undoable from './undoable'

const undoableReducer = undoable(
  reducer,
  undoableSlice,
  isUndoableAction,
  emptyAnnotations,
)

const middleware = getDefaultMiddleware({ serializableCheck: false })

export default function createStore(filePath: string) {
  const persistConfig = {
    key: `state:${filePath}`,
    storage,
    blacklist: ['past', 'future'],
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
