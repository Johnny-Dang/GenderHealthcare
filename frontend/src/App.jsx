import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import BlogManagement from './pages/blog/BlogManagement'
import BlogPage from './pages/blog/BlogPage'
import BlogDetailPage from './pages/blog/BlogDetailPage'
import TestServicePage from './pages/test-service'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'

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
      path: '*',
      element: <NotFound />
    },
    {
      path: '/test-service',
      element: <TestServicePage />
    }
  ])
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RouterProvider router={router} />
        </PersistGate>
      </Provider>
    </>
  )
}

export default App
