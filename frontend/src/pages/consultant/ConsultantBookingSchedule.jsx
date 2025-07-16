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
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  CalendarDays,
  Bell,
  CheckCheck,
  XOctagon,
  AlertCircle
} from 'lucide-react'
import { Table, Tag, Button, Card, Typography, Badge, Empty, Statistic, Row, Col, Tooltip, Spin } from 'antd'
import { useToast } from '@/hooks/useToast'
import Loading from '../../components/Loading'
import { motion, AnimatePresence } from 'framer-motion'

const { Title, Text } = Typography

function ConsultantBookingSchedule() {
  // Thêm hook useToast
  const { showSuccess, showError } = useToast()

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
      showError('Bạn cần đăng nhập để xem lịch đặt tư vấn')
      setLoading(false)
      return
    }

    // Check for consultant role instead of just id
    if (userInfo.role !== 'Consultant') {
      showError('Bạn không có quyền xem lịch đặt tư vấn này')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await api.get(`/api/ConsultationBooking/consultant/${userInfo.accountId}`)
      setBookings(response.data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      showError('Không thể tải danh sách lịch đặt')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // Ensure newStatus is one of the valid values: "pending", "confirmed", "cancelled"
      if (!['pending', 'confirmed', 'cancelled'].includes(newStatus)) {
        showError('Trạng thái không hợp lệ')
        return
      }

      const response = await api.patch(`/api/ConsultationBooking/${bookingId}/status`, `"${newStatus}"`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      setBookings(
        bookings.map((booking) => (booking.bookingId === bookingId ? { ...booking, status: newStatus } : booking))
      )

      const statusMessage = {
        confirmed: 'chấp nhận',
        cancelled: 'từ chối'
      }

      showSuccess(`Đã ${statusMessage[newStatus] || 'cập nhật'} lịch hẹn`)
    } catch (error) {
      console.error('Error updating booking status:', error.message)

      showError(`Không thể cập nhật trạng thái: ${error.response?.data?.message || error.message}`)
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

  const getStatusBadge = (status) => {
    let config = {
      color: 'default',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      text: status || 'N/A',
      icon: null
    }

    switch (status) {
      case 'pending':
        config = {
          color: 'warning',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          text: 'Đang chờ',
          icon: <Bell className='w-4 h-4 mr-1 text-yellow-500' />
        }
        break
      case 'confirmed':
        config = {
          color: 'success',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          text: 'Đã xác nhận',
          icon: <CheckCircle className='w-4 h-4 mr-1 text-green-500' />
        }
        break
      case 'cancelled':
        config = {
          color: 'error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          text: 'Đã từ chối',
          icon: <XCircle className='w-4 h-4 mr-1 text-red-500' />
        }
        break
    }

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center px-3 py-1.5 rounded-full ${config.bgColor} ${config.textColor} ${config.borderColor} border`}
      >
        {config.icon}
        <span className='font-medium'>{config.text}</span>
      </motion.div>
    )
  }

  const columns = [
    {
      title: 'Người đặt',
      dataIndex: 'person',
      key: 'person',
      width: '20%',
      render: (_, record) => {
        if (record.customerId) {
          return (
            <motion.div
              className='flex flex-col gap-1'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex items-center gap-2'>
                <Badge dot status='processing' color='cyan' />
                <Text strong className='text-gray-800'>
                  {record.customerName}
                </Text>
              </div>
              <div className='flex items-center text-gray-500 text-sm'>
                <Mail className='w-3.5 h-3.5 mr-1.5 text-cyan-500' />
                <Text type='secondary'>{record.customerEmail}</Text>
              </div>
              {record.customerPhone && (
                <div className='flex items-center text-gray-500 text-sm'>
                  <Phone className='w-3.5 h-3.5 mr-1.5 text-cyan-500' />
                  <Text type='secondary'>{record.customerPhone}</Text>
                </div>
              )}
              <Tag color='cyan' style={{ marginTop: '4px' }} className='border-cyan-300'>
                <span className='flex items-center'>
                  <User className='w-3.5 h-3.5 mr-1' />
                  Người dùng đã đăng ký
                </span>
              </Tag>
            </motion.div>
          )
        } else {
          return (
            <motion.div
              className='flex flex-col gap-1'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex items-center gap-2'>
                <Badge dot status='default' />
                <Text strong className='text-gray-800'>
                  {record.guestName}
                </Text>
              </div>
              <div className='flex items-center text-gray-500 text-sm'>
                <Mail className='w-3.5 h-3.5 mr-1.5 text-pink-500' />
                <Text type='secondary'>{record.guestEmail}</Text>
              </div>
              <div className='flex items-center text-gray-500 text-sm'>
                <Phone className='w-3.5 h-3.5 mr-1.5 text-pink-500' />
                <Text type='secondary'>{record.guestPhone}</Text>
              </div>
              <Tag color='pink' style={{ marginTop: '4px' }} className='border-pink-300'>
                <span className='flex items-center'>
                  <User className='w-3.5 h-3.5 mr-1' />
                  Khách vãng lai
                </span>
              </Tag>
            </motion.div>
          )
        }
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className='p-4 shadow-lg rounded-lg bg-white'>
          <input
            className='border border-pink-200 rounded-lg px-3 py-2 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent'
            placeholder='Tìm theo số điện thoại'
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onKeyDown={(e) => e.key === 'Enter' && confirm()}
          />
          <div className='flex gap-2'>
            <button
              className='bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-lg px-4 py-2 text-sm hover:shadow-lg transition-shadow flex-1'
              onClick={() => confirm()}
            >
              Tìm kiếm
            </button>
            <button
              className='bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm hover:bg-gray-200 transition-colors flex-1'
              onClick={() => clearFilters()}
            >
              Xóa bộ lọc
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
        <Tooltip title='Thời gian đã đặt lịch'>
          <div className='flex items-center bg-pink-50 px-3 py-2 rounded-lg border border-pink-100 w-fit'>
            <Calendar className='w-4 h-4 mr-2 text-pink-500' />
            <span className='font-medium'>{formatDateTime(scheduledAt)}</span>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      width: '30%',
      render: (message) => (
        <div className='flex bg-gray-50 p-3 rounded-lg border border-gray-100'>
          <MessageSquare className='w-5 h-5 mr-3 text-pink-400 flex-shrink-0' />
          <div className='overflow-hidden'>
            {message ? (
              <div className='line-clamp-2 text-gray-700'>{message}</div>
            ) : (
              <span className='text-gray-400 italic'>Không có ghi chú</span>
            )}
          </div>
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
            <motion.button
              whileHover={{ scale: record.status !== 'confirmed' ? 1.05 : 1 }}
              whileTap={{ scale: record.status !== 'confirmed' ? 0.95 : 1 }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition font-medium ${
                record.status === 'confirmed'
                  ? 'bg-green-100 text-green-600 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md'
              }`}
              disabled={record.status === 'confirmed'}
              onClick={() => updateBookingStatus(record.bookingId, 'confirmed')}
              type='button'
            >
              <CheckCircle className='w-4 h-4' />
              Xác nhận
            </motion.button>
            <motion.button
              whileHover={{ scale: record.status !== 'cancelled' ? 1.05 : 1 }}
              whileTap={{ scale: record.status !== 'cancelled' ? 0.95 : 1 }}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition font-medium ${
                record.status === 'cancelled'
                  ? 'bg-red-100 text-red-600 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:shadow-md'
              }`}
              disabled={record.status === 'cancelled'}
              onClick={() => updateBookingStatus(record.bookingId, 'cancelled')}
              type='button'
            >
              <XCircle className='w-4 h-4' />
              Từ chối
            </motion.button>
          </div>
        )
      }
    }
  ]

  const filteredBookings = bookings.filter((b) => {
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

  // Nếu không có userInfo thì return luôn (không render gì cả)
  if (!userInfo) return null

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-pink-100'>
      <Navigation />

      <main className='flex-1 container mx-auto px-4 py-8 max-w-7xl'>
        <motion.div initial='hidden' animate='visible' variants={fadeIn} className='mb-8'>
          <div className='bg-white border border-pink-100 p-6 rounded-xl shadow-lg mb-6 bg-gradient-to-r from-white to-pink-50'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
              <div className='mb-4 md:mb-0'>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Title
                    level={3}
                    className='text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 m-0 flex items-center'
                  >
                    <Calendar className='w-7 h-7 mr-3 text-pink-500' />
                    Quản lý lịch đặt tư vấn
                  </Title>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Text className='text-pink-600'>Xem và quản lý các lịch hẹn tư vấn từ khách hàng</Text>
                </motion.div>
              </div>
              <motion.div className='flex gap-2' whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button
                  className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-shadow'
                  onClick={fetchBookings}
                  type='button'
                >
                  <RefreshCw className='w-4 h-4 animate-pulse' />
                  Làm mới dữ liệu
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Bộ lọc */}
              <motion.div
                className='mb-6 shadow-lg rounded-xl bg-white p-6 flex flex-wrap gap-4 items-center border border-pink-100'
                whileHover={{ boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.1)' }}
              >
                <div className='flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100 flex-grow md:flex-grow-0'>
                  <Search className='w-5 h-5 text-pink-400' />
                  <input
                    placeholder='Tìm kiếm theo số điện thoại...'
                    className='bg-transparent border-none w-full focus:outline-none'
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />
                </div>

                <div className='flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100'>
                  <Filter className='w-5 h-5 text-pink-400' />
                  <select
                    className='bg-transparent border-none focus:outline-none'
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                    style={{ minWidth: 150 }}
                  >
                    <option value='all'>Tất cả trạng thái</option>
                    <option value='pending'>Đang chờ</option>
                    <option value='confirmed'>Đã chấp nhận</option>
                    <option value='cancelled'>Đã từ chối</option>
                  </select>
                </div>

                <div className='flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100'>
                  <CalendarDays className='w-5 h-5 text-pink-400' />
                  <input
                    type='date'
                    className='bg-transparent border-none focus:outline-none'
                    onChange={(e) => setDateFilter(e.target.value)}
                    value={dateFilter || ''}
                    style={{ minWidth: 150 }}
                  />
                </div>
              </motion.div>

              <motion.div
                className='bg-white rounded-xl shadow-lg border border-pink-100 overflow-hidden'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className='p-6'>
                  {/* Tổng quan */}
                  <motion.div
                    className='mb-8 grid grid-cols-1 md:grid-cols-4 gap-4'
                    variants={staggerContainer}
                    initial='hidden'
                    animate='visible'
                  >
                    <motion.div
                      variants={cardVariants}
                      className='bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-6 shadow-sm border border-pink-200 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='text-3xl font-bold text-pink-600'>{stats.total}</div>
                          <div className='text-sm text-pink-700 font-medium mt-1'>Tổng số lịch hẹn</div>
                        </div>
                        <div className='p-3 bg-pink-200 bg-opacity-50 rounded-full'>
                          <Calendar className='w-6 h-6 text-pink-600' />
                        </div>
                      </div>
                      <div className='w-full h-2 bg-pink-200 bg-opacity-50 rounded-full mt-4'>
                        <div className='h-2 bg-pink-500 rounded-full' style={{ width: '100%' }}></div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 shadow-sm border border-yellow-200 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='text-3xl font-bold text-yellow-600'>{stats.pending}</div>
                          <div className='text-sm text-yellow-700 font-medium mt-1'>Đang chờ xác nhận</div>
                        </div>
                        <div className='p-3 bg-yellow-200 bg-opacity-50 rounded-full'>
                          <Bell className='w-6 h-6 text-yellow-600' />
                        </div>
                      </div>
                      <div className='w-full h-2 bg-yellow-200 bg-opacity-50 rounded-full mt-4'>
                        <div
                          className='h-2 bg-yellow-500 rounded-full'
                          style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='text-3xl font-bold text-green-600'>{stats.confirmed}</div>
                          <div className='text-sm text-green-700 font-medium mt-1'>Đã chấp nhận</div>
                        </div>
                        <div className='p-3 bg-green-200 bg-opacity-50 rounded-full'>
                          <CheckCheck className='w-6 h-6 text-green-600' />
                        </div>
                      </div>
                      <div className='w-full h-2 bg-green-200 bg-opacity-50 rounded-full mt-4'>
                        <div
                          className='h-2 bg-green-500 rounded-full'
                          style={{ width: `${stats.total ? (stats.confirmed / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={cardVariants}
                      className='bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 shadow-sm border border-red-200 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='text-3xl font-bold text-red-600'>{stats.cancelled}</div>
                          <div className='text-sm text-red-700 font-medium mt-1'>Đã từ chối</div>
                        </div>
                        <div className='p-3 bg-red-200 bg-opacity-50 rounded-full'>
                          <XOctagon className='w-6 h-6 text-red-600' />
                        </div>
                      </div>
                      <div className='w-full h-2 bg-red-200 bg-opacity-50 rounded-full mt-4'>
                        <div
                          className='h-2 bg-red-500 rounded-full'
                          style={{ width: `${stats.total ? (stats.cancelled / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Table
                      columns={columns}
                      dataSource={filteredBookings.map((booking) => ({ ...booking, key: booking.bookingId }))}
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng cộng: ${total} lịch hẹn`,
                        showSizeChanger: true
                      }}
                      bordered
                      rowClassName={(record) => {
                        if (record.status === 'pending') return 'bg-yellow-50 hover:bg-yellow-100 transition-colors'
                        if (record.status === 'confirmed') return 'bg-green-50 hover:bg-green-100 transition-colors'
                        if (record.status === 'cancelled') return 'bg-red-50 hover:bg-red-100 transition-colors'
                        return ''
                      }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className='text-gray-500'>Không tìm thấy lịch đặt nào</span>}
                          />
                        )
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ConsultantBookingSchedule
