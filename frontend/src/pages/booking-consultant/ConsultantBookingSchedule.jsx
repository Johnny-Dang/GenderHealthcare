import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from '@/configs/axios'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  Search,
  CalendarDays,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  List,
  RefreshCw,
  Bell
} from 'lucide-react'
import {
  Table,
  Spin,
  Popconfirm,
  DatePicker,
  Input,
  Select,
  Tag,
  Space,
  Button,
  Tabs,
  Card,
  Typography,
  Badge,
  Empty,
  Statistic,
  Row,
  Col,
  Alert,
  Tooltip
} from 'antd'
import { toast } from 'react-toastify'

const { Title, Text, Paragraph } = Typography

function ConsultantBookingSchedule() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  })
  const userInfo = useSelector((state) => state.user.userInfo)

  // Fetch bookings when component mounts
  useEffect(() => {
    fetchBookings()
  }, [userInfo])

  // Calculate stats when bookings change
  useEffect(() => {
    const newStats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length
    }
    setStats(newStats)
  }, [bookings])

  const fetchBookings = async () => {
    if (!userInfo) {
      toast.error('Bạn cần đăng nhập để xem lịch đặt tư vấn')
      setLoading(false)
      return
    }

    // Check for consultant role instead of just id
    if (userInfo.role !== 'Consultant') {
      toast.error('Bạn không có quyền xem lịch đặt tư vấn này')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // If we're here, the user is authorized, so proceed with the API call
      const response = await api.get(`/api/ConsultationBooking/consultant/${userInfo.accountId}`)
      setBookings(response.data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Không thể tải danh sách lịch đặt')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      console.log(`Updating booking ${bookingId} to status: ${newStatus}`) // Debug log

      // Ensure newStatus is one of the valid values: "pending", "confirmed", "cancelled"
      if (!['pending', 'confirmed', 'cancelled'].includes(newStatus)) {
        toast.error('Trạng thái không hợp lệ')
        return
      }

      // The server expects a simple string value, not an object
      // Send the status as a direct string value, not wrapped in an object
      const response = await api.patch(`/api/ConsultationBooking/${bookingId}/status`, `"${newStatus}"`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('API Response:', response) // Debug log to check response

      // Update local state after successful API call
      setBookings(
        bookings.map((booking) => (booking.bookingId === bookingId ? { ...booking, status: newStatus } : booking))
      )

      const statusMessage = {
        confirmed: 'chấp nhận',
        cancelled: 'từ chối'
      }

      toast.success(`Đã ${statusMessage[newStatus] || 'cập nhật'} lịch hẹn`)
    } catch (error) {
      console.error('Error updating booking status:', error)
      console.error('Error details:', error.response?.data) // Log more details about the error
      toast.error(`Không thể cập nhật trạng thái: ${error.response?.data?.message || error.message}`)
    }
  }

  // Format date and time for display
  const formatDateTime = (dateTimeStr) => {
    try {
      const date = parseISO(dateTimeStr)
      return format(date, 'HH:mm - EEEE, dd/MM/yyyy', { locale: vi })
    } catch (error) {
      return dateTimeStr || 'N/A'
    }
  }

  // Get appropriate status badge - update to match the new status values
  const getStatusBadge = (status) => {
    let color = 'default'
    let text = status || 'N/A'
    let icon = null

    switch (status) {
      case 'pending':
        color = 'warning'
        text = 'Đang chờ'
        icon = <Clock className='w-4 h-4 mr-1 text-pink-500' />
        break
      case 'confirmed':
        color = 'success'
        text = 'Đã chấp nhận'
        icon = <CheckCircle className='w-4 h-4 mr-1 text-pink-500' />
        break
      case 'cancelled':
        color = 'error'
        text = 'Đã từ chối'
        icon = <XCircle className='w-4 h-4 mr-1 text-pink-500' />
        break
      default:
        color = 'default'
        text = status || 'N/A'
    }

    return (
      <Tag color={color}>
        <span className='flex items-center'>
          {icon}
          {text}
        </span>
      </Tag>
    )
  }

  // Table columns for Ant Design Table with enhanced styling
  const columns = [
    {
      title: 'Người đặt',
      dataIndex: 'person',
      key: 'person',
      width: '20%',
      render: (_, record) => {
        if (record.customerId) {
          return (
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <Badge dot status='processing' />
                <Text strong>{record.customerName}</Text>
              </div>
              <div className='flex items-center text-gray-500 text-sm'>
                <Mail className='w-3.5 h-3.5 mr-1.5 text-blue-500' />
                <Text type='secondary'>{record.customerEmail}</Text>
              </div>
              {record.customerPhone && (
                <div className='flex items-center text-gray-500 text-sm'>
                  <Phone className='w-3.5 h-3.5 mr-1.5 text-blue-500' />
                  <Text type='secondary'>{record.customerPhone}</Text>
                </div>
              )}
              <Tag color='blue' style={{ marginTop: '4px' }}>
                <span className='flex items-center'>
                  <User className='w-3.5 h-3.5 mr-1' />
                  Người dùng đã đăng ký
                </span>
              </Tag>
            </div>
          )
        } else {
          return (
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <Badge dot status='default' />
                <Text strong>{record.guestName}</Text>
              </div>
              <div className='flex items-center text-gray-500 text-sm'>
                <Mail className='w-3.5 h-3.5 mr-1.5 text-blue-500' />
                <Text type='secondary'>{record.guestEmail}</Text>
              </div>
              <div className='flex items-center text-gray-500 text-sm'>
                <Phone className='w-3.5 h-3.5 mr-1.5 text-blue-500' />
                <Text type='secondary'>{record.guestPhone}</Text>
              </div>
              <Tag color='default' style={{ marginTop: '4px' }}>
                <span className='flex items-center'>
                  <User className='w-3.5 h-3.5 mr-1' />
                  Khách
                </span>
              </Tag>
            </div>
          )
        }
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className='p-2'>
          <input
            className='border rounded px-2 py-1 w-full mb-2'
            placeholder='Tìm theo số điện thoại'
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onKeyDown={(e) => e.key === 'Enter' && confirm()}
          />
          <div className='flex gap-2'>
            <button
              className='bg-pink-500 text-white rounded px-3 py-1 text-sm hover:bg-pink-600'
              onClick={() => confirm()}
            >
              Tìm
            </button>
            <button
              className='bg-gray-200 text-gray-700 rounded px-3 py-1 text-sm hover:bg-gray-300'
              onClick={() => clearFilters()}
            >
              Xóa
            </button>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        const searchPhone = value.toLowerCase()
        return (
          (record.customerPhone && record.customerPhone.toLowerCase().includes(searchPhone)) ||
          (record.guestPhone && record.guestPhone.toLowerCase().includes(searchPhone))
        )
      }
    },
    {
      title: 'Thời gian hẹn',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: '20%',
      render: (scheduledAt) => (
        <div className='flex items-center'>
          <Calendar className='w-4 h-4 mr-2 text-pink-500' />
          <span>{formatDateTime(scheduledAt)}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      width: '30%',
      render: (message) => (
        <div className='flex'>
          <MessageSquare className='w-4 h-4 mr-2 mt-1 text-pink-400 flex-shrink-0' />
          <span className='truncate'>{message || <span className='text-gray-400 italic'>Không có ghi chú</span>}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => getStatusBadge(status),
      filters: [
        { text: 'Đang chờ', value: 'pending' },
        { text: 'Đã chấp nhận', value: 'confirmed' },
        { text: 'Đã từ chối', value: 'cancelled' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '15%',
      render: (_, record) => {
        // Hiển thị 2 nút luôn, mỗi nút sẽ disabled nếu trạng thái đã đúng
        return (
          <div className='flex gap-2'>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition font-medium ${
                record.status === 'confirmed'
                  ? 'bg-green-100 text-green-600 cursor-not-allowed opacity-60'
                  : 'bg-pink-500 text-white hover:bg-pink-600'
              }`}
              disabled={record.status === 'confirmed'}
              onClick={() => updateBookingStatus(record.bookingId, 'confirmed')}
              type='button'
            >
              <CheckCircle className='w-4 h-4' />
              Đánh dấu đã xác nhận
            </button>
            <button
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition font-medium ${
                record.status === 'cancelled'
                  ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={record.status === 'cancelled'}
              onClick={() => updateBookingStatus(record.bookingId, 'cancelled')}
              type='button'
            >
              <XCircle className='w-4 h-4' />
              Đánh dấu không thể liên hệ
            </button>
          </div>
        )
      }
    }
  ]

  // Define tab items for Ant Design Tabs with enhanced content
  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span className='flex items-center gap-1.5'>
          <CalendarDays className='w-4 h-4' /> Tổng quan
        </span>
      ),
      children: (
        <div className='py-4'>
          <Row gutter={[16, 16]} className='mb-5'>
            <Col xs={24} sm={12} md={6}>
              <Card variant='outlined' className='shadow-sm'>
                <Statistic title='Tổng số lịch hẹn' value={stats.total} valueStyle={{ color: '#ec4899' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant='outlined' className='shadow-sm'>
                <Statistic title='Đang chờ xác nhận' value={stats.pending} valueStyle={{ color: '#f59e42' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant='outlined' className='shadow-sm'>
                <Statistic title='Đã chấp nhận' value={stats.confirmed} valueStyle={{ color: '#a855f7' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card variant='outlined' className='shadow-sm'>
                <Statistic title='Đã từ chối' value={stats.cancelled} valueStyle={{ color: '#f43f5e' }} />
              </Card>
            </Col>
          </Row>
          <Card
            title={
              <Title level={5} className='flex items-center m-0 text-pink-700'>
                <Clock className='w-5 h-5 mr-2 text-pink-500' />
                Lịch hẹn gần đây
              </Title>
            }
            className='shadow-sm'
            extra={
              <Button type='link' onClick={fetchBookings} className='text-pink-600 flex items-center'>
                <RefreshCw className='w-4 h-4 mr-1' />
                Cập nhật
              </Button>
            }
          >
            {bookings.length > 0 ? (
              <Table
                columns={columns}
                dataSource={bookings.slice(0, 5).map((booking) => ({ ...booking, key: booking.bookingId }))}
                pagination={false}
                size='small'
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Chưa có lịch hẹn nào' />
            )}
          </Card>
        </div>
      )
    },
    {
      key: 'list',
      label: (
        <span className='flex items-center gap-1.5'>
          <List className='w-4 h-4' /> Danh sách
        </span>
      ),
      children: (
        <Card className='shadow-sm'>
          <Table
            columns={columns}
            dataSource={bookings.map((booking) => ({ ...booking, key: booking.bookingId }))}
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Tổng cộng: ${total} lịch hẹn`,
              showSizeChanger: true
            }}
            bordered
            rowClassName={(record) => (record.status === 'pending' ? 'bg-pink-50' : '')}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      Không tìm thấy lịch đặt nào
                      <br />
                      <Button type='link' onClick={fetchBookings}>
                        Tải lại dữ liệu
                      </Button>
                    </span>
                  }
                />
              )
            }}
          />
        </Card>
      )
    }
  ]

  // Lọc dữ liệu theo trạng thái, số điện thoại, ngày
  const filteredBookings = bookings.filter((b) => {
    // Lọc theo trạng thái
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    // Lọc theo số điện thoại
    if (searchTerm) {
      const phone = (b.customerPhone || b.guestPhone || '').toLowerCase()
      if (!phone.includes(searchTerm.toLowerCase())) return false
    }
    // Lọc theo ngày (so sánh yyyy-mm-dd)
    if (dateFilter) {
      const bookingDate = b.scheduledAt ? b.scheduledAt.slice(0, 10) : ''
      if (bookingDate !== dateFilter) return false
    }
    return true
  })

  return (
    <div className='min-h-screen flex flex-col bg-pink-50'>
      <Navigation />

      <main className='flex-1 container mx-auto px-4 py-8 max-w-7xl'>
        <div className='mb-8'>
          <div className='bg-white border border-pink-100 p-6 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <Title level={3} className='text-[#be185d] m-0 flex items-center'>
                <Calendar className='w-7 h-7 mr-3 text-pink-500' /> Quản lý lịch đặt tư vấn
              </Title>
              <Text className='text-pink-600'>Xem và quản lý các lịch hẹn tư vấn từ khách hàng</Text>
            </div>
            <div className='mt-4 md:mt-0 flex gap-2'>
              <button
                className='flex items-center gap-2 px-4 py-2 rounded bg-pink-500 text-white font-medium hover:bg-pink-600 transition'
                onClick={fetchBookings}
                type='button'
              >
                <RefreshCw className='w-4 h-4' />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='shadow-sm rounded-xl bg-white p-8 flex flex-col items-center justify-center'>
            <Spin spinning={true} size='large' />
            <span className='mt-4 text-gray-500'>Đang tải danh sách lịch đặt...</span>
          </div>
        ) : !userInfo ? (
          <div className='shadow-sm rounded-xl bg-white p-8 flex flex-col items-center justify-center'>
            <User size={48} className='text-pink-300 mb-4' />
            <Title level={4} className='text-pink-700'>
              Bạn cần đăng nhập để xem lịch đặt tư vấn
            </Title>
            <button
              className='mt-4 px-6 py-2 rounded bg-pink-500 text-white font-medium hover:bg-pink-600 transition'
              type='button'
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : (
          <>
            {/* Bộ lọc */}
            <div className='mb-6 shadow-sm rounded-xl bg-white p-4 flex flex-wrap gap-4 items-center'>
              <input
                placeholder='Tìm kiếm theo số điện thoại...'
                className='border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400'
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                style={{ width: 220 }}
              />
              <select
                className='border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400'
                onChange={(e) => setStatusFilter(e.target.value)}
                value={statusFilter}
                style={{ minWidth: 150 }}
              >
                <option value='all'>Tất cả trạng thái</option>
                <option value='pending'>Đang chờ</option>
                <option value='confirmed'>Đã chấp nhận</option>
                <option value='cancelled'>Đã từ chối</option>
              </select>
              <input
                type='date'
                className='border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400'
                onChange={(e) => setDateFilter(e.target.value)}
                value={dateFilter || ''}
                style={{ minWidth: 150 }}
              />
            </div>

            {/* 
              Nếu muốn dùng tab chuyển qua lại giữa Tổng quan/Danh sách, hãy dùng state và logic ở đây.
              Hiện tại chỉ hiển thị 1 tab duy nhất (Tổng quan + Danh sách luôn hiển thị).
              Để bật lại tab, hãy tham khảo code cũ ở các phiên bản trước.
            */}

            <div className='bg-white rounded-xl shadow-sm'>
              <div className='p-6'>
                {/* Tổng quan */}
                <div className='mb-8 grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <div className='bg-pink-100 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-pink-600'>{stats.total}</div>
                    <div className='text-sm text-pink-700'>Tổng số lịch hẹn</div>
                  </div>
                  <div className='bg-yellow-100 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-yellow-600'>{stats.pending}</div>
                    <div className='text-sm text-yellow-700'>Đang chờ xác nhận</div>
                  </div>
                  <div className='bg-purple-100 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-purple-600'>{stats.confirmed}</div>
                    <div className='text-sm text-purple-700'>Đã chấp nhận</div>
                  </div>
                  <div className='bg-red-100 rounded-lg p-4 text-center'>
                    <div className='text-2xl font-bold text-red-500'>{stats.cancelled}</div>
                    <div className='text-sm text-red-700'>Đã từ chối</div>
                  </div>
                </div>
                {/* Danh sách */}
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-pink-100'>
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className='px-4 py-2 text-left text-xs font-semibold text-pink-700 uppercase bg-pink-50'
                          >
                            {col.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className='text-center py-8 text-gray-400'>
                            Không tìm thấy lịch đặt nào
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((record) => (
                          <tr key={record.bookingId} className={record.status === 'pending' ? 'bg-pink-50' : ''}>
                            {columns.map((col) => (
                              <td key={col.key} className='px-4 py-3 align-top'>
                                {col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ConsultantBookingSchedule
