import React from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import { AuthProvider } from './contexts/AuthContext'
import CycleTrackingPage from './pages/cycle-tracking/CycleTrackingPage'
import CycleTrackingResultPage from './pages/cycle-tracking/CycleTrackingResultPage'

function App() {
  // Using HashRouter for better compatibility with different server configurations
  const router = createHashRouter([
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/register',
      element: <RegisterPage />
    },
    {
      path: '/cycle-tracking',
      element: <CycleTrackingPage />
    },
    {
      path: '/cycle-tracking/result',
      element: <CycleTrackingResultPage />
    },
    {
      path: '*',
      element: <NotFound />
    }
  ])

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
