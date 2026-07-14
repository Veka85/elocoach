import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/**
 * Application Entry Point
 *
 * REACT 18 CONCEPT:
 * React 18 introduced createRoot() (replacing render()).
 * createRoot() enables concurrent features like:
 * - Automatic batching of state updates
 * - Suspense for data fetching
 * - useTransition for non-blocking UI updates
 *
 * StrictMode is a development-only tool that:
 * - Double-invokes renders and effects to detect side effects
 * - Warns about deprecated APIs
 * - In React 18+, it simulates unmounting and remounting (effects run twice in dev!)
 * This doesn't affect production builds.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
