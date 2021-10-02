import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import AnnotationPage from './pages/AnnotationPage'
import SourceSelectionPage from './pages/SourceSelectionPage'
import { SettingsProvider } from './hooks/useSettings'

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <Switch>
          <Route exact path='/'>
            <SourceSelectionPage />
          </Route>
          <Route exact path='/file/:hash'>
            <AnnotationPage />
          </Route>
        </Switch>
      </Router>
    </SettingsProvider>
  )
}
