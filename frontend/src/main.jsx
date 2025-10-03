import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './pages/App'
import Create from './pages/Create'
import Play from './pages/Play'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/create', element: <Create /> },
  { path: '/play/:storyId', element: <Play /> },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
