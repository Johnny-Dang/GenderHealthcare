import React from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import { AuthProvider } from './contexts/AuthContext'
import CycleTrackingPage from './pages/cycle-tracking/CycleTrackingPage'
import CycleTrackingResultPage from './pages/cycle-tracking/CycleTrackingResultPage'
import BlogManagement from './pages/blog/BlogManagement'
import BlogPage from './pages/blog/BlogPage'
import BlogDetailPage from './pages/blog/BlogDetailPage'
import { ToastContainer } from 'react-toastify'
import TestServicePage from './pages/test-service'

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
    //* Blog
    {
      path: '/blog',
      element: <BlogPage />
    },
    {
      path: '/blog/:id',
      element: <BlogDetailPage />
    },
    // Role: Staff
    // {
    //   path: '/staff',
    //   element: <StaffPage />
    // },
    {
      path: '/staff/blog',
      element: <BlogManagement />
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
