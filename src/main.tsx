import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import App from './App'
import './index.css'
import createStore from './store'

const filePath =
  'CodeReadingClubs/www/blob/908de054006934a071f770906119ce6d35a5a612/package.json'

const { store, persistor } = createStore(filePath)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
)
