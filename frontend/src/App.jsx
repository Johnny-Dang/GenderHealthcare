import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from 'react-toastify'
import TestServicePage from './pages/test-service'
import BookConsultantPage from './pages/booking-consultant'

function App() {
  const router = createBrowserRouter([
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
      path: '/booking-consultant',
      element: <BookConsultantPage />
    },
    {
      path: '*',
      element: <NotFound />
    },
    {
      path: '/test-service',
      element: <TestServicePage />
    }
  ])
  return (
    <div>
      <AuthProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  )
}

export default App
