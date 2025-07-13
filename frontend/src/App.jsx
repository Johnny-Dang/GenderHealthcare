import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor, ensureStoreStructure } from './redux/store'
import { Spin } from 'antd'

// Loading component cho PersistGate
const PersistLoading = () => (
  <div className='min-h-screen flex items-center justify-center bg-gray-50'>
    <Spin size='large' tip='Đang tải ứng dụng...' />
  </div>
)

// Guard and Layouts
import AuthGuard from './components/AuthGuard'
import StaffLayout from './pages/staff-dashboard/StaffLayout'

// Pages
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import NotFound from './pages/NotFound'
import ProfilePage from './pages/profile'
import BlogPage from './pages/staff-dashboard/blog/BlogPage'
import BlogDetailPage from './pages/staff-dashboard/blog/BlogDetailPage'
import CycleTrackingPage from './pages/cycle-tracking/CycleTrackingPage'
import CycleTrackingResultPage from './pages/cycle-tracking/CycleTrackingResultPage'
import TestServicePage from './pages/test-service'
import BookingConsultant from './pages/booking-consultant'
import ConsultantBookingSchedule from './pages/consultant/ConsultantBookingSchedule'
import TestResultsPage from './pages/consultant/TestResultsPage'
import CartPage from './pages/cart'
import VnPayReturn from './pages/payment/VnPayReturn'
import CustomerDashboard from './pages/customer-dashboard/CustomerDashboard'
import BookingDetailPage from './pages/customer-dashboard/BookingDetailPage'
import StaffDashboard from './pages/staff-dashboard/dashboard/StaffDashboard'
import BlogManagement from './pages/staff-dashboard/blog/BlogManagement'
import AppointmentsManagement from './pages/staff-dashboard/Appoinments/AppointmentsManagement'
import TestResultsManagement from './pages/staff-dashboard/TestResult/TestResultsManagement'
import AdminPage from './pages/admin/Admin'
import DashboardHome from './pages/admin/DashboardHome'
import UserManagement from './pages/admin/UserManagement'
import TestServiceManagement from './pages/admin/TestServiceManagement'
import ManagerDashboard from './pages/manager-dashboard'
import ManagerFeedbackManagement from './pages/manager-dashboard/feedback'
import ManagerPaymentManagement from './pages/manager-dashboard/payment'
import ManagerStaffManagement from './pages/manager-dashboard/staff'
import ManagerTestServiceManagement from './pages/manager-dashboard/test-service'
import JobManagement from './pages/admin/JobManagement'
import AboutPage from './pages/about'
import ScrollToTop from './components/ScrollToTop'

/**
 * Application root with routing and Redux persistence
 */
function App() {
  useEffect(() => {
    ensureStoreStructure()
  }, [])

  const router = createBrowserRouter([
    {
      element: <ScrollToTop />,
      children: [
        // Public Routes
        { path: '/', element: <HomePage /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/blog', element: <BlogPage /> },
        { path: '/blog/:id', element: <BlogDetailPage /> },
        { path: '/cycle-tracking', element: <CycleTrackingPage /> },
        { path: '/cycle-tracking/result', element: <CycleTrackingResultPage /> },
        { path: '/test-service', element: <TestServicePage /> },
        { path: '/booking-consultant', element: <BookingConsultant /> },
        { path: '/about', element: <AboutPage /> },
        // Authenticated
        {
          path: '/profile',
          element: (
            <AuthGuard allowedRoles={['Customer', 'Staff', 'Consultant', 'Manager', 'Admin']}>
              <ProfilePage />
            </AuthGuard>
          )
        },
        { path: '/cart', element: <CartPage /> },
        { path: '/checkout/vnpay-return', element: <VnPayReturn /> },

        // Staff Dashboard
        {
          path: '/staff',
          element: (
            <AuthGuard allowedRoles={['Staff']}>
              <StaffLayout />
            </AuthGuard>
          ),
          children: [
            { index: true, element: <Navigate to='dashboard' replace /> },
            { path: 'dashboard', element: <StaffDashboard /> },
            { path: 'blog', element: <BlogManagement /> },
            { path: 'appointments', element: <AppointmentsManagement /> },
            { path: 'test-results', element: <TestResultsManagement /> }
          ]
        },

        // Admin Dashboard
        {
          path: '/admin',
          element: (
            <AuthGuard allowedRoles={['Admin', 'Manager']}>
              <AdminPage />
            </AuthGuard>
          ),
          children: [
            { index: true, element: <Navigate to='dashboard' replace /> },
            { path: 'dashboard', element: <DashboardHome /> },
            { path: 'users', element: <UserManagement /> },
            { path: 'services', element: <TestServiceManagement /> },
            { path: 'jobs', element: <JobManagement /> }
          ]
        },

        // Manager Dashboard
        {
          path: '/manager/dashboard',
          element: (
            <AuthGuard allowedRoles={['Manager', 'Admin']}>
              <ManagerDashboard />
            </AuthGuard>
          ),
          children: [
            { index: true, element: <Navigate to='feedback' replace /> },
            { path: 'feedback', element: <ManagerFeedbackManagement /> },
            { path: 'payment', element: <ManagerPaymentManagement /> },
            { path: 'staff', element: <ManagerStaffManagement /> },
            { path: 'test-service', element: <ManagerTestServiceManagement /> }
          ]
        },

        // Consultant
        {
          path: '/consultant',
          element: (
            <AuthGuard allowedRoles={['Consultant', 'Staff', 'Manager']}>
              <Outlet />
            </AuthGuard>
          ),
          children: [
            { path: 'schedule', element: <ConsultantBookingSchedule /> },
            { path: 'test-results', element: <TestResultsPage /> }
          ]
        },

        // Customer Dashboard
        {
          path: '/customer',
          element: (
            <AuthGuard allowedRoles={['Customer']}>
              <Outlet />
            </AuthGuard>
          ),
          children: [
            { path: 'dashboard', element: <CustomerDashboard /> },
            { path: 'booking/:bookingId', element: <BookingDetailPage /> }
          ]
        }
      ]
    },

    // Fallback
    { path: '*', element: <NotFound /> }
  ])

  return (
    <Provider store={store}>
      <PersistGate loading={<PersistLoading />} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  )
}

export default App
