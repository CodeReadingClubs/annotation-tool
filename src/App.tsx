import React from 'react'
import AnnotationPage from './pages/AnnotationPage'
import SourceSelectionPage from './pages/SourceSelectionPage'
import { useSelector } from './store'

export default function App() {
  const hasCode = useSelector((state) => state.code !== '')

  if (hasCode) {
    return <AnnotationPage />
  } else {
    return <SourceSelectionPage />
  }
}
