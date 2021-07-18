import React from 'react'
import AnnotationPage from './components/AnnotationPage'
import SourceSelectionPage from './components/SourceSelectionPage'
import { useSelector } from './store'

export default function App() {
  const hasCode = useSelector((state) => state.code !== '')

  if (hasCode) {
    return <AnnotationPage />
  } else {
    return <SourceSelectionPage />
  }
}
