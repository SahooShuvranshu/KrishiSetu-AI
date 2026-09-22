import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { AppProvider } from './context/AppContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AppProvider>
        <ToastProvider>
          {/* Outermost guard: catches a crash inside <App> itself, where the
              inner boundary (inside App, with translations) cannot help. */}
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ToastProvider>
      </AppProvider>
    </HashRouter>
  </React.StrictMode>,
)