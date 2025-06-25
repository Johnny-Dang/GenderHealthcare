import React from 'react'
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom'
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
import CustomerDashboard from './pages/customer-dashboard/BookingDashboard'
import BookingDetailPage from './pages/customer-dashboard/BookingDetailPage'

/**
 * Root component for the application, setting up routing and Redux state management with persistence.
 *
 * Defines all application routes and wraps the app with Redux Provider and PersistGate to enable global state and state persistence across sessions.
 *
 * @returns {JSX.Element} The application root element with routing and state management configured.
 */
import UserManagement from './pages/admin/UserManagement'
import TestServiceManagement from './pages/admin/TestServiceManagement'
import AdminPage from './pages/admin/Admin'
import DashboardHome from './pages/admin/DashboardHome'
import ManagerDashboard from './pages/manager-dashboard'
import ManagerFeedbackManagement from './pages/manager-dashboard/feedback'
import ManagerPaymentManagement from './pages/manager-dashboard/payment'
import ManagerStaffManagement from './pages/manager-dashboard/staff'
import ManagerTestServiceManagement from './pages/manager-dashboard/test-service'

function App() {
  // Using HashRouter for better compatibility with different server configurations
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
      path: '/test-service',
      element: <TestServicePage />
    },
    {
      path: '/admin',
      element: <AdminPage />,
      children: [
        {
          index: true,
          element: <Navigate to='dashboard' replace />
        },
        {
          path: 'dashboard',
          element: <DashboardHome />
        },
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
      path: '/manager/dashboard',
      element: <ManagerDashboard />,
      children: [
        {
          index: true,
          element: null
        },
        {
          path: 'feedback',
          element: <ManagerFeedbackManagement />
        },
        {
          path: 'payment',
          element: <ManagerPaymentManagement />
        },
        {
          path: 'staff',
          element: <ManagerStaffManagement />
        },
        {
          path: 'test-service',
          element: <ManagerTestServiceManagement />
        }
      ]
    },
    {
      path: '/manager-dashboard',
      element: <Navigate to='/manager/dashboard' replace />
    },
    {
      path: '/customer-dashboard',
      element: <CustomerDashboard />
    },
    {
      path: '/customer-dashboard/booking/:bookingId',
      element: <BookingDetailPage />
    },

    // Cái page này để cuối nếu not found
    {
      path: '*',
      element: <NotFound />
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
