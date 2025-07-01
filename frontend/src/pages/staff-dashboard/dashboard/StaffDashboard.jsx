import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Typography, Card, Row, Col, Statistic, Spin } from 'antd'
import { Calendar, ClipboardCheck, FileText } from 'lucide-react'
import api from '../../../configs/axios'
import { useSelector } from 'react-redux'

const { Title, Text } = Typography
const { Meta } = Card

const StaffDashboard = () => {
  const location = useLocation()
  const user = useSelector((state) => state.user.user)

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    blogs: { total: 0, published: 0, loading: true },
    appointments: { total: 0, upcoming: 0, loading: true },
    testResults: { total: 0, pending: 0, loading: true }
  })
  const [recentBlogs, setRecentBlogs] = useState([])
  const [recentAppointments, setRecentAppointments] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    fetchBlogStats()
    fetchAppointmentStats()
    fetchTestResultStats()
    fetchRecentData()
  }

  const fetchBlogStats = async () => {
    try {
      const response = await api.get('/api/Blog')
      if (response.data && Array.isArray(response.data)) {
        const blogs = response.data
        const total = blogs.length
        const published = blogs.filter((b) => b.isPublished).length

        setDashboardStats((prev) => ({
          ...prev,
          blogs: { total, published, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching blog stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        blogs: { ...prev.blogs, loading: false }
      }))
    }
  }

  const fetchAppointmentStats = async () => {
    try {
      const response = await api.get('/api/ConsultationBooking')
      if (response.data && Array.isArray(response.data)) {
        const appointments = response.data
        const total = appointments.length
        const upcoming = appointments.filter(
          (a) => new Date(a.consultationTime) > new Date() && a.status !== 'Cancelled'
        ).length

        setDashboardStats((prev) => ({
          ...prev,
          appointments: { total, upcoming, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching appointment stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        appointments: { ...prev.appointments, loading: false }
      }))
    }
  }

  const fetchTestResultStats = async () => {
    try {
      const response = await api.get('/api/TestResult')
      if (response.data && Array.isArray(response.data)) {
        const results = response.data
        const total = results.length
        const pending = results.filter((r) => r.status === 'Pending').length

        setDashboardStats((prev) => ({
          ...prev,
          testResults: { total, pending, loading: false }
        }))
      }
    } catch (error) {
      console.error('Error fetching test result stats:', error)
      setDashboardStats((prev) => ({
        ...prev,
        testResults: { ...prev.testResults, loading: false }
      }))
    }
  }

  const fetchRecentData = async () => {
    setLoadingRecent(true)
    try {
      // Fetch recent blogs
      const blogResponse = await api.get('/api/Blog')
      if (blogResponse.data && Array.isArray(blogResponse.data)) {
        const sortedBlogs = blogResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((blog) => ({
            id: blog.blogId,
            title: blog.title,
            category: blog.categoryName || 'Chưa phân loại',
            date: new Date(blog.createdAt)
          }))
        setRecentBlogs(sortedBlogs)
      }

      // Fetch recent appointments
      const appointmentResponse = await api.get('/api/ConsultationBooking')
      if (appointmentResponse.data && Array.isArray(appointmentResponse.data)) {
        const sortedAppointments = appointmentResponse.data
          .sort((a, b) => new Date(a.consultationTime) - new Date(b.consultationTime))
          .filter((a) => new Date(a.consultationTime) > new Date())
          .slice(0, 5)
          .map((appointment) => ({
            id: appointment.consultationBookingId,
            patientName: appointment.customerName,
            date: new Date(appointment.consultationTime),
            status: appointment.status
          }))
        setRecentAppointments(sortedAppointments)
      }
    } catch (error) {
      console.error('Error fetching recent data:', error)
    } finally {
      setLoadingRecent(false)
    }
  }

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A'

    const now = new Date()
    const diff = now - date

    // Less than an hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `${mins} phút trước`
    }

    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} giờ trước`
    }

    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days} ngày trước`
    }

    // Otherwise return formatted date
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div>
      <Title level={4} className='mb-6'>
        Tổng quan Nhân viên
      </Title>

      {/* Stats */}
      <Row gutter={16} className='mb-6'>
        <Col span={8}>
          <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
            {dashboardStats.blogs.loading ? (
              <div className='flex justify-center items-center p-4'>
                <Spin />
              </div>
            ) : (
              <Statistic
                title='Tổng số Blog'
                value={dashboardStats.blogs.total}
                valueStyle={{ color: '#1677ff' }}
                prefix={<FileText size={18} className='mr-2' />}
              />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
            {dashboardStats.appointments.loading ? (
              <div className='flex justify-center items-center p-4'>
                <Spin />
              </div>
            ) : (
              <Statistic
                title='Lịch hẹn sắp tới'
                value={dashboardStats.appointments.upcoming}
                valueStyle={{ color: '#52c41a' }}
                prefix={<Calendar size={18} className='mr-2' />}
              />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className='shadow-sm hover:shadow-md transition-all'>
            {dashboardStats.testResults.loading ? (
              <div className='flex justify-center items-center p-4'>
                <Spin />
              </div>
            ) : (
              <Statistic
                title='Kết quả đang chờ'
                value={dashboardStats.testResults.pending}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ClipboardCheck size={18} className='mr-2' />}
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
        <Col span={8}>
          <Link to='/staff/blog'>
            <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
              <FileText size={36} className='text-blue-500 mb-4' />
              <Meta title='Quản lý Blog' description='Tạo và quản lý bài viết cho bệnh nhân' />
            </Card>
          </Link>
        </Col>
        <Col span={8}>
          <Link to='/staff/appointments'>
            <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
              <Calendar size={36} className='text-green-500 mb-4' />
              <Meta title='Quản lý Lịch hẹn' description='Xem và quản lý lịch hẹn với bệnh nhân' />
            </Card>
          </Link>
        </Col>
        <Col span={8}>
          <Link to='/staff/test-results'>
            <Card hoverable className='text-center h-52 flex flex-col justify-center items-center'>
              <ClipboardCheck size={36} className='text-orange-500 mb-4' />
              <Meta title='Quản lý Kết quả' description='Quản lý và tải lên kết quả xét nghiệm' />
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Recent activities */}
      <Title level={4} className='mt-8 mb-4'>
        Hoạt động gần đây
      </Title>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title='Blog gần đây'
            extra={<Link to='/staff/blog'>Xem tất cả</Link>}
            className='h-64'
            loading={loadingRecent}
          >
            {recentBlogs.length > 0 ? (
              <div className='space-y-3'>
                {recentBlogs.map((blog, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <div>
                      <Text strong>{blog.title}</Text>
                      <Text type='secondary' className='block'>
                        {blog.category}
                      </Text>
                    </div>
                    <Text type='secondary'>{formatDate(blog.date)}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex justify-center items-center h-40'>
                <Text type='secondary'>Không có blog nào</Text>
              </div>
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title='Lịch hẹn sắp tới'
            extra={<Link to='/staff/appointments'>Xem tất cả</Link>}
            className='h-64'
            loading={loadingRecent}
          >
            {recentAppointments.length > 0 ? (
              <div className='space-y-3'>
                {recentAppointments.map((appointment, index) => (
                  <div key={index} className='flex items-center justify-between'>
                    <div>
                      <Text strong>{appointment.patientName}</Text>
                      <Text
                        type={
                          appointment.status === 'Confirmed'
                            ? 'success'
                            : appointment.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                        }
                        className='block'
                      >
                        {appointment.status}
                      </Text>
                    </div>
                    <Text>
                      {appointment.date.toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex justify-center items-center h-40'>
                <Text type='secondary'>Không có lịch hẹn nào</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default StaffDashboard
