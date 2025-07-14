import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Typography, Card, Row, Col, Statistic, Spin, Tag } from 'antd'
import { Calendar, ClipboardCheck, FileText, Clock, CheckCircle } from 'lucide-react'
import api from '../../../configs/axios'
import { useSelector } from 'react-redux'

const { Title, Text } = Typography
const { Meta } = Card

const StaffDashboard = () => {
  const location = useLocation()
  const user = useSelector((state) => state.user.userInfo)

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
      const response = await api.get('/api/Blog/published')
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
      // Sử dụng endpoint đúng để lấy booking details
      const response = await api.get('/api/booking-details')
      if (response.data && Array.isArray(response.data)) {
        const appointments = response.data
        const total = appointments.length

        // Lọc các lịch hẹn sắp tới dựa trên slotDate thay vì consultationTime
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = appointments.filter(
          (a) => new Date(a.slotDate) >= today && a.status !== 'Đã có kết quả' && a.status !== 'Đã xét nghiệm'
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
      // Sử dụng booking-details endpoint để lấy tất cả booking details
      const response = await api.get('/api/booking-details')

      if (response.data && Array.isArray(response.data)) {
        const results = response.data
        const total = results.length

        // Đếm các trạng thái khác nhau
        const tested = results.filter((r) => r.status === 'Đã xét nghiệm').length
        const completed = results.filter((r) => r.status === 'Đã có kết quả').length
        const pending = tested // Số kết quả đang chờ chính là số đã xét nghiệm nhưng chưa upload kết quả

        setDashboardStats((prev) => ({
          ...prev,
          testResults: {
            total,
            tested,
            completed,
            pending,
            loading: false
          }
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
      const blogResponse = await api.get('/api/Blog/published')
      if (blogResponse.data && Array.isArray(blogResponse.data)) {
        const sortedBlogs = blogResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3) // Chỉ lấy 3 blog gần đây nhất
          .map((blog) => ({
            id: blog.blogId,
            title: blog.title,
            category: blog.categoryName || 'Chưa phân loại',
            date: new Date(blog.createdAt)
          }))
        setRecentBlogs(sortedBlogs)
        console.log('Recent blogs loaded:', sortedBlogs) // Debug log
      } else {
        console.log('Blog response format unexpected:', blogResponse.data) // Debug log
      }

      // Fetch recent appointments with the correct endpoint
      const appointmentResponse = await api.get('/api/booking-details')
      if (appointmentResponse.data && Array.isArray(appointmentResponse.data)) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const sortedAppointments = appointmentResponse.data
          // Chỉ lấy những lịch hẹn trong tương lai
          .filter((a) => new Date(a.slotDate) >= today)
          // Sắp xếp theo ngày gần nhất
          .sort((a, b) => new Date(a.slotDate) - new Date(b.slotDate))
          .slice(0, 5)
          .map((appointment) => ({
            id: appointment.bookingDetailId,
            patientName: `${appointment.firstName} ${appointment.lastName}`,
            date: new Date(appointment.slotDate),
            status: appointment.status,
            shift: appointment.slotShift,
            serviceName: appointment.serviceName || 'Không xác định'
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
                value={dashboardStats.testResults.total}
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
                      <div className='flex flex-col'>
                        <Text
                          type={
                            appointment.status === 'Confirmed' || appointment.status === 'Đã xét nghiệm'
                              ? 'success'
                              : appointment.status === 'Pending' || appointment.status === 'Chưa xét nghiệm'
                                ? 'warning'
                                : 'danger'
                          }
                          className='text-xs'
                        >
                          {appointment.status} {appointment.shift === 'AM' ? '(Sáng)' : '(Chiều)'}
                        </Text>
                        <Text type='secondary' className='text-xs italic'>
                          {appointment.serviceName}
                        </Text>
                      </div>
                    </div>
                    <Text>
                      {appointment.date.toLocaleDateString('vi-VN', {
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
