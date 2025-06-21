import React from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import CycleTrackingPage from './pages/cycle-tracking/CycleTrackingPage'
import CycleTrackingResultPage from './pages/cycle-tracking/CycleTrackingResultPage'
import BlogManagement from './pages/blog/BlogManagement'
import BlogPage from './pages/blog/BlogPage'
import BlogDetailPage from './pages/blog/BlogDetailPage'
import TestServicePage from './pages/test-service'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'

/**
 * Root component for the application, setting up routing and Redux state management with persistence.
 * 
 * Defines all application routes and wraps the app with Redux Provider and PersistGate to enable global state and state persistence across sessions.
 * 
 * @returns {JSX.Element} The application root element with routing and state management configured.
 */
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
