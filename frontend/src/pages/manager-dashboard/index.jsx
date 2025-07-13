import React, { useState, useEffect } from 'react'
import { Link, Routes, Route, Navigate, useLocation, Outlet, useNavigate } from 'react-router-dom'
import FeedbackManagement from './feedback'
import PaymentManagement from './payment'
import StaffManagement from './staff'
import TestServiceManagement from './test-service'
import {
  Layout,
  Menu,
  theme,
  Avatar,
  Badge,
  Typography,
  Button,
  Breadcrumb,
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Dropdown
} from 'antd'
import {
  MessageSquare,
  CreditCard,
  Users,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Bell,
  UserCircle,
  Heart,
  TrendingUp,
  Star,
  Calendar,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react'
import api from '../../configs/axios'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/features/userSlice'
import { toast } from 'react-toastify'

const { Header, Content, Footer, Sider } = Layout
const { Title, Text } = Typography
const { Meta } = Card

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label: <Link to={`/manager/dashboard/${key}`}>{label}</Link>
  }
}

const items = [
  getItem('Tổng quan', '', <TrendingUp size={18} />),
  getItem('Quản lý Feedback', 'feedback', <MessageSquare size={18} />),
  getItem('Quản lý Thanh toán', 'payment', <CreditCard size={18} />),
  getItem('Quản lý Nhân viên', 'staff', <Users size={18} />),
  getItem('Quản lý Dịch vụ', 'test-service', <Stethoscope size={18} />)
]

const ManagerDashboard = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumbItems, setBreadcrumbItems] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const userInfo = useSelector((state) => state.user?.userInfo || {})
  const dispatch = useDispatch()
  
  // Kiểm tra user có đăng nhập và có role Manager
  const isManager = userInfo?.accountId && userInfo?.role === 'Manager'

  // États pour les données du dashboard
  const [dashboardStats, setDashboardStats] = useState({
    feedback: { total: 0, fiveStars: 0, average: 0, loading: true },
    payment: { total: 0, totalAmount: 0, loading: true },
    staff: { total: 0, departments: 0, loading: true },
    services: { total: 0, active: 0, loading: true }
  })
  const [recentFeedbacks, setRecentFeedbacks] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const breadcrumbMap = {
    '/manager/dashboard': [{ title: 'Manager' }, { title: 'Tổng quan' }],
    '/manager/dashboard/feedback': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Feedback' }
    ],
    '/manager/dashboard/payment': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Thanh toán' }
    ],
    '/manager/dashboard/staff': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Nhân viên' }
    ],
    '/manager/dashboard/test-service': [
      { title: <Link to='/manager/dashboard'>Manager</Link> },
      { title: 'Quản lý Dịch vụ' }
    ]
  }

  // Fetch dashboard data
  useEffect(() => {
    if (location.pathname === '/manager/dashboard' || location.pathname === '/manager/dashboard/') {
      fetchDashboardData()
    }
  }, [location.pathname])

  // Update breadcrumb based on current path
  useEffect(() => {
    const path = location.pathname
    const exactPath = Object.keys(breadcrumbMap).find((p) => p === path)
    const breadcrumb = breadcrumbMap[exactPath] || breadcrumbMap['/manager-dashboard']
    setBreadcrumbItems(breadcrumb)
  }, [location])

  // Kiểm tra quyền truy cập Manager
  useEffect(() => {
    if (!isManager) {
      console.log('Not authorized as Manager, redirecting to home')
      navigate('/')
    }
  }, [isManager, navigate])

  const fetchDashboardData = async () => {
    // Récupérer les données de feedback
    fetchFeedbackStats()
    // Récupérer les données de paiement
    fetchPaymentStats()
    // Récupérer les données de staff
    fetchStaffStats()
    // Récupérer les données de services
    fetchServiceStats()
    // Récupérer les données récentes
    fetchRecentData()
  }

  const fetchFeedbackStats = async () => {
    try {
      const response = await api.get('/api/Feedback')
      if (response.data && Array.isArray(response.data)) {
        const feedbacks = response.data
        const total = feedbacks.length
        const fiveStars = feedbacks.filter((f) => f.rating === 5).length
        const average = total ? parseFloat((feedbacks.reduce((a, b) => a + b.rating, 0) / total).toFixed(1)) : 0

        setDashboardStats((prev) => ({
          ...prev,
          feedback: { total, fiveStars, average, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching feedback stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        feedback: { ...prev.feedback, loading: false }
      }))
    }
  }

  const fetchPaymentStats = async () => {
    try {
      const response = await api.get('/api/payments/with-booking-info')
      if (response.data && Array.isArray(response.data)) {
        const payments = response.data
        const total = payments.length
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

        setDashboardStats((prev) => ({
          ...prev,
          payment: { total, totalAmount, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        payment: { ...prev.payment, loading: false }
      }))
    }
  }

  const fetchStaffStats = async () => {
    try {
      const response = await api.get('/api/StaffInfo')
      if (response.data && Array.isArray(response.data)) {
        const staffs = response.data
        const total = staffs.length
        const departments = new Set(staffs.map((s) => s.department)).size

        setDashboardStats((prev) => ({
          ...prev,
          staff: { total, departments, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching staff stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        staff: { ...prev.staff, loading: false }
      }))
    }
  }

  const fetchServiceStats = async () => {
    try {
      const response = await api.get('/api/services/admin')
      if (response.data && Array.isArray(response.data)) {
        const services = response.data
        const total = services.length
        const active = services.filter((s) => !s.isDeleted).length

        setDashboardStats((prev) => ({
          ...prev,
          services: { total, active, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching service stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        services: { ...prev.services, loading: false }
      }))
    }
  }

  const fetchRecentData = async () => {
    setLoadingRecent(true)
    try {
      // Récupérer les feedbacks récents
      const feedbackResponse = await api.get('/api/Feedback')
      if (feedbackResponse.data && Array.isArray(feedbackResponse.data)) {
        // Trier par date et prendre les 3 plus récents
        const sortedFeedbacks = feedbackResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map((fb) => ({
            id: fb.feedbackId,
            customerName: fb.accountName,
            serviceName: fb.serviceName,
            rating: fb.rating,
            comment: fb.comment,
            date: new Date(fb.createdAt)
          }))
        setRecentFeedbacks(sortedFeedbacks)
      }

      // Récupérer les paiements récents
      const paymentResponse = await api.get('/api/payments/with-booking-info')
      if (paymentResponse.data && Array.isArray(paymentResponse.data)) {
        // Trier par date et prendre les 4 plus récents
        const sortedPayments = await Promise.all(
          paymentResponse.data
            .sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
            .slice(0, 3)
            .map(async (payment) => {
              // Fetch service name from booking details
              let serviceName = 'N/A'
              try {
                const res = await api.get(`/api/booking-details/booking/${payment.bookingId}`)
                const details = res.data

                if (Array.isArray(details) && details.length > 0) {
                  serviceName = details
                    .map((d) => d.serviceName)
                    .filter(Boolean)
                    .join(', ')
                } else if (details && typeof details === 'object') {
                  serviceName = details.serviceName || 'N/A'
                }
              } catch (err) {
                console.error(err)
              }

              return {
                id: payment.transactionId,
                amount: payment.amount,
                customerName: `${payment.firstName} ${payment.lastName}`,
                serviceName: serviceName,
                date: new Date(payment.createAt)
              }
            })
        )
        setRecentPayments(sortedPayments)
      }
    } catch (error) {
      console.error('Error fetching recent data:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  // Xác định menu active
  const getActiveMenu = () => {
    const path = location.pathname
    if (path === '/manager/dashboard') return ''
    if (path.includes('/feedback')) return 'feedback'
    if (path.includes('/payment')) return 'payment'
    if (path.includes('/staff')) return 'staff'
    if (path.includes('/test-service')) return 'test-service'
    return ''
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A'

    const now = new Date()
    const diff = now - date

    // Si moins d'une heure
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `${mins} phút trước`
    }

    // Si moins d'un jour
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} giờ trước`
    }

    // Si moins d'une semaine
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days} ngày trước`
    }

    // Sinon retourner la date formatée
    return date.toLocaleDateString('vi-VN')
  }

  // Dashboard overview content
  const renderDashboardOverview = () => {
    if (location.pathname === '/manager/dashboard' || location.pathname === '/manager/dashboard/') {
      return (
        <div>
          <Title level={4} className='mb-6'>
            Tổng quan Quản lý
          </Title>

          {/* Stats */}
          <Row gutter={16} className='mb-6'>
            <Col span={6}>
              <Card
                bordered={false}
                className='shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-l-4 border-pink-400'
              >
                {dashboardStats.feedback.loading ? (
                  <div className='flex justify-center items-center p-4'>
                    <Spin />
                  </div>
                ) : (
                  <Statistic
                    title='Tổng số Feedback'
                    value={dashboardStats.feedback.total}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<MessageSquare size={18} className='mr-2 animate-pulse text-pink-500' />}
                    className='transition-all duration-300 hover:scale-105'
                  />
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                bordered={false}
                className='shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-l-4 border-blue-400'
              >
                {dashboardStats.payment.loading ? (
                  <div className='flex justify-center items-center p-4'>
                    <Spin />
                  </div>
                ) : (
                  <Statistic
                    title='Tổng thanh toán'
                    value={dashboardStats.payment.totalAmount}
                    precision={0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<CreditCard size={18} className='mr-2 animate-pulse text-blue-500' />}
                    suffix='VND'
                    className='transition-all duration-300 hover:scale-105'
                  />
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                bordered={false}
                className='shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-l-4 border-green-400'
              >
                {dashboardStats.staff.loading ? (
                  <div className='flex justify-center items-center p-4'>
                    <Spin />
                  </div>
                ) : (
                  <Statistic
                    title='Tổng số Nhân viên'
                    value={dashboardStats.staff.total}
                    valueStyle={{ color: '#1677ff' }}
                    prefix={<Users size={18} className='mr-2 animate-pulse text-green-500' />}
                    className='transition-all duration-300 hover:scale-105'
                  />
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card
                bordered={false}
                className='shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-l-4 border-purple-400'
              >
                {dashboardStats.services.loading ? (
                  <div className='flex justify-center items-center p-4'>
                    <Spin />
                  </div>
                ) : (
                  <Statistic
                    title='Dịch vụ có sẵn'
                    value={dashboardStats.services.active}
                    valueStyle={{ color: '#722ed1' }}
                    prefix={<Stethoscope size={18} className='mr-2 animate-pulse text-purple-500' />}
                    className='transition-all duration-300 hover:scale-105'
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Quick access cards */}
          <Title level={4} className='mb-4'>
            Truy cập nhanh
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Link to='/manager/dashboard/feedback'>
                <Card
                  hoverable
                  className='text-center h-52 flex flex-col justify-center items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-pink-400 border-2 border-transparent group'
                >
                  <MessageSquare
                    size={36}
                    className='text-pink-500 mb-4 transition-all duration-300 group-hover:scale-125'
                  />
                  <Meta
                    title={
                      <span className='transition-all duration-300 group-hover:text-pink-500'>Quản lý Feedback</span>
                    }
                    description='Xem và quản lý phản hồi từ khách hàng'
                  />
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to='/manager/dashboard/payment'>
                <Card
                  hoverable
                  className='text-center h-52 flex flex-col justify-center items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-blue-400 border-2 border-transparent group'
                >
                  <CreditCard
                    size={36}
                    className='text-blue-500 mb-4 transition-all duration-300 group-hover:scale-125'
                  />
                  <Meta
                    title={
                      <span className='transition-all duration-300 group-hover:text-blue-500'>Quản lý Thanh toán</span>
                    }
                    description='Xem và quản lý thanh toán của dịch vụ'
                  />
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to='/manager/dashboard/staff'>
                <Card
                  hoverable
                  className='text-center h-52 flex flex-col justify-center items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-green-400 border-2 border-transparent group'
                >
                  <Users size={36} className='text-green-500 mb-4 transition-all duration-300 group-hover:scale-125' />
                  <Meta
                    title={
                      <span className='transition-all duration-300 group-hover:text-green-500'>Quản lý Nhân viên</span>
                    }
                    description='Xem và quản lý thông tin nhân viên'
                  />
                </Card>
              </Link>
            </Col>
            <Col span={6}>
              <Link to='/manager/dashboard/test-service'>
                <Card
                  hoverable
                  className='text-center h-52 flex flex-col justify-center items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-purple-400 border-2 border-transparent group'
                >
                  <Stethoscope
                    size={36}
                    className='text-purple-500 mb-4 transition-all duration-300 group-hover:scale-125'
                  />
                  <Meta
                    title={
                      <span className='transition-all duration-300 group-hover:text-purple-500'>Quản lý Dịch vụ</span>
                    }
                    description='Xem và quản lý dịch vụ xét nghiệm'
                  />
                </Card>
              </Link>
            </Col>
          </Row>

          {/* Recent activities */}
          <Title level={4} className='mt-8 mb-4'>
            Hoạt động gần đây
          </Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card
                title={<span className='text-pink-600 font-medium'>Đánh giá gần đây</span>}
                extra={
                  <Link
                    to='/manager/dashboard/feedback'
                    className='text-pink-500 hover:text-pink-700 hover:underline transition-all duration-300'
                  >
                    Xem tất cả
                  </Link>
                }
                className='h-64 transition-all duration-300 hover:shadow-md border-pink-200 hover:border-pink-400'
                loading={loadingRecent}
              >
                {recentFeedbacks.length > 0 ? (
                  <div className='space-y-3'>
                    {recentFeedbacks.map((feedback, index) => (
                      <div key={index} className='flex items-center justify-between mb-3 pb-2 border-b'>
                        <div>
                          <Text strong>{feedback.customerName}</Text>
                          <div className='flex items-center'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < feedback.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          {feedback.comment && (
                            <div className='mt-1'>
                              <Text italic className='text-xs text-gray-600 line-clamp-2' title={feedback.comment}>
                                "{feedback.comment}"
                              </Text>
                            </div>
                          )}
                        </div>
                        <Text type='secondary'>{formatDate(feedback.date)}</Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex justify-center items-center h-40'>
                    <Text type='secondary'>Không có đánh giá nào</Text>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={<span className='text-blue-600 font-medium'>Thanh toán gần đây</span>}
                extra={
                  <Link
                    to='/manager/dashboard/payment'
                    className='text-blue-500 hover:text-blue-700 hover:underline transition-all duration-300'
                  >
                    Xem tất cả
                  </Link>
                }
                className='h-64 transition-all duration-300 hover:shadow-md border-blue-200 hover:border-blue-400'
                loading={loadingRecent}
              >
                {recentPayments.length > 0 ? (
                  <div className='space-y-3'>
                    {recentPayments.map((payment, index) => (
                      <div key={index} className='flex flex-col mb-2 pb-2 border-b'>
                        <div className='flex items-center justify-between'>
                          <Text className='text-xs truncate' type='secondary'>
                            {payment.customerName}
                          </Text>
                          <Text type='success'>{payment.amount.toLocaleString('vi-VN')}đ</Text>
                        </div>
                        <div className='flex items-center justify-between'>
                          <Text className='text-xs truncate'>{payment.serviceName}</Text>
                          <Text className='text-xs text-gray-500'>{formatDate(payment.date)}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex justify-center items-center h-40'>
                    <Text type='secondary'>Không có thanh toán nào</Text>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={8}>
              <Card
                title={<span className='text-green-600 font-medium'>Thông tin hệ thống</span>}
                className='h-64 transition-all duration-300 hover:shadow-md border-green-200 hover:border-green-400'
              >
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Đánh giá trung bình</Text>
                      <Text type='secondary' className='block'>
                        Mức độ hài lòng chung
                      </Text>
                    </div>
                    <div className='flex items-center'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < Math.round(dashboardStats.feedback.average)
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                      <Text className='ml-2' strong>
                        {dashboardStats.feedback.average.toFixed(1)}
                      </Text>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Tổng phòng ban</Text>
                      <Text type='secondary' className='block'>
                        Số phòng ban hoạt động
                      </Text>
                    </div>
                    <Text>{dashboardStats.staff.departments}</Text>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Text strong>Đánh giá 5 sao</Text>
                      <Text type='secondary' className='block'>
                        Tỉ lệ
                      </Text>
                    </div>
                    <Text>
                      {dashboardStats.feedback.total > 0
                        ? `${((dashboardStats.feedback.fiveStars / dashboardStats.feedback.total) * 100).toFixed(1)}%`
                        : '0%'}
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
    return null
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = userInfo?.accessToken

      if (token) {
        await api.post(
          '/Account/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      }
    } catch (error) {
      console.log('Lỗi logout API:', error)
    } finally {
      dispatch(logout())
      navigate('/')
    }
  }

  // Profile dropdown items
  const profileMenuItems = [
    {
      key: 'profile',
      label: 'Cập nhật hồ sơ',
      icon: <Settings size={16} />,
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      danger: true
    }
  ]

  return (
    <Layout className='min-h-screen'>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null} // Hide default trigger
        className='shadow-lg bg-gradient-to-b from-pink-50 to-pink-100'
        width={250}
      >
        <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'justify-start px-6'} h-16`}>
          <div className='w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center'>
            <Heart className='h-6 w-6 text-white' />
          </div>
          {!collapsed && (
            <span className='ml-3 text-2xl font-bold gradient-text'>
              <Link to='/' className='hover:text-pink-800'>
                WellCare
              </Link>
            </span>
          )}
        </div>

        <Menu
          theme='light'
          defaultSelectedKeys={['']}
          mode='inline'
          items={items}
          className='border-r-0 bg-transparent'
          selectedKeys={[getActiveMenu()]}
          style={{ backgroundColor: 'transparent', color: '#666' }}
        />
      </Sider>

      <Layout>
        <Header
          className='px-5 flex items-center justify-between shadow-md'
          style={{ padding: '0 24px', height: 64, backgroundColor: 'white', borderBottom: '1px solid #f0f0f0' }}
        >
          <div className='flex items-center'>
            <Button
              type='text'
              icon={collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              onClick={() => setCollapsed(!collapsed)}
              className='text-base mr-4 text-pink-500 hover:text-pink-700 transition-all duration-300 hover:shadow-md hover:scale-110'
            />
            <Breadcrumb className='my-4' items={breadcrumbItems} />
          </div>

          <div className='flex items-center gap-4'>
            <Badge count={3} size='small' color='#eb2f96' className='transition-all duration-300 hover:scale-110'>
              <Bell
                size={18}
                className='cursor-pointer text-slate-600 hover:text-pink-500 transition-all duration-300 hover:rotate-12'
              />
            </Badge>
            <Dropdown
              menu={{
                items: profileMenuItems
              }}
              placement='bottomRight'
              trigger={['click']}
            >
              <div className='flex items-center gap-3 cursor-pointer hover:bg-pink-50 px-3 py-1.5 rounded-full transition-all duration-300 hover:shadow-md border border-pink-100 group'>
                <Avatar
                  size={38}
                  className='bg-gradient-to-r from-pink-400 to-pink-600 border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg'
                  icon={<UserCircle size={22} />}
                />
                <div className='hidden md:block'>
                  <Text strong className='text-gray-800 leading-tight block'>
                    {userInfo
                      ? userInfo.firstName && userInfo.lastName
                        ? `${userInfo.lastName} ${userInfo.firstName}`
                        : userInfo.fullName || userInfo.email || 'Manager'
                      : 'Manager'}
                  </Text>
                  <div className='flex items-center text-xs text-gray-500'>
                    <span>Quản lý</span>
                    <ChevronDown size={12} className='ml-1' />
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className='m-6'>
          <div className='p-6 min-h-[360px] bg-white rounded-lg shadow-md'>
            {location.pathname === '/manager/dashboard' || location.pathname === '/manager/dashboard/' ? (
              renderDashboardOverview()
            ) : (
              <Outlet />
            )}
          </div>
        </Content>

        <Footer className='text-center py-3 px-12 bg-pink-50 border-t border-pink-100'>
          <div className='flex items-center justify-center gap-2'>
            <Heart size={16} className='text-pink-500' />
            <Text type='secondary'>WellCare ©{new Date().getFullYear()}</Text>
          </div>
        </Footer>
      </Layout>
    </Layout>
  )
}

export default ManagerDashboard
