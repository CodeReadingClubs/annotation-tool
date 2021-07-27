import React from 'react'
import AnnotationPage from './pages/AnnotationPage'
import SourceSelectionPage from './pages/SourceSelectionPage'

export default function App() {
  const hasCode = true

  if (hasCode) {
    return <AnnotationPage />
  } else {
    return <SourceSelectionPage />
  }
}
