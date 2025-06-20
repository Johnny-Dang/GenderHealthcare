import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import { AuthProvider } from './contexts/AuthContext'
import BlogManagement from './pages/blog/BlogManagement'
import BlogPage from './pages/blog/BlogPage'
import BlogDetailPage from './pages/blog/BlogDetailPage'
import { ToastContainer } from 'react-toastify'
import TestServicePage from './pages/test-service'
import DashboardAdmin from './components/dashboard'
import UserManagement from './pages/admin/UserManagement'
import ProductManagement from './pages/admin/TestServiceManagement'
import TestServiceManagement from './pages/admin/TestServiceManagement'
import AdminPage from './pages/admin/Admin'

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
      path: '/test-service',
      element: <TestServicePage />
    },
    {
      path: '/admin',
      element: <AdminPage />,
      children: [
        {
          path: 'users',
          element: <UserManagement />
        },
        {
          path: 'services',
          element: <TestServiceManagement />
        }
      ]
    },
    {
      path: '*',
      element: <NotFound />
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
