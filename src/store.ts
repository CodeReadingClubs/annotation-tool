import { configureStore } from '@reduxjs/toolkit'
import {
  TypedUseSelectorHook,
  useDispatch as ogUseDispatch,
  useSelector as ogUseSelector,
} from 'react-redux'
import reducer, { State } from './reducer'

const store = configureStore({ reducer })

export default store

export type AppDispatch = typeof store.dispatch

export const useDispatch = () => ogUseDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<State> = ogUseSelector
