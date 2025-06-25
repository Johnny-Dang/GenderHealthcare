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
        <div style={{ padding: 8 }}>
          <Input
            placeholder='Tìm theo tên'
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type='primary' onClick={() => confirm()} icon={<Search />} size='small' style={{ width: 90 }}>
              Tìm
            </Button>
            <Button onClick={() => clearFilters()} size='small' style={{ width: 90 }}>
              Xóa
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        const searchName = value.toLowerCase()
        return (
          (record.customerName && record.customerName.toLowerCase().includes(searchName)) ||
          (record.guestName && record.guestName.toLowerCase().includes(searchName))
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
          <Calendar className='w-4 h-4 mr-2 text-blue-600' />
          <Text>{formatDateTime(scheduledAt)}</Text>
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
          <MessageSquare className='w-4 h-4 mr-2 mt-1 text-blue-500 flex-shrink-0' />
          <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'Xem thêm' }}>
            {message || <span className='text-gray-400 italic'>Không có ghi chú</span>}
          </Paragraph>
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
        if (record.status === 'pending') {
          return (
            <Space size='small'>
              <Popconfirm
                title='Xác nhận chấp nhận lịch hẹn'
                description='Bạn có chắc chắn muốn chấp nhận lịch hẹn này?'
                onConfirm={() => updateBookingStatus(record.bookingId, 'confirmed')}
                okText='Chấp nhận'
                cancelText='Hủy'
                icon={<CheckCircle className='text-green-500' />}
              >
                <Button type='primary' size='small' className='flex items-center gap-1 bg-blue-600 hover:bg-blue-700'>
                  <CheckCircle className='w-3.5 h-3.5' />
                  <span>Chấp nhận</span>
                </Button>
              </Popconfirm>
              <Popconfirm
                title='Xác nhận từ chối lịch hẹn'
                description='Bạn có chắc chắn muốn từ chối lịch hẹn này?'
                onConfirm={() => updateBookingStatus(record.bookingId, 'cancelled')}
                okText='Từ chối'
                cancelText='Hủy'
                icon={<AlertCircle className='text-red-500' />}
              >
                <Button danger size='small' className='flex items-center gap-1'>
                  <XCircle className='w-3.5 h-3.5' />
                  <span>Từ chối</span>
                </Button>
              </Popconfirm>
            </Space>
          )
        }
        return null
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
              <Card bordered={false} className='shadow-sm'>
                <Statistic title='Tổng số lịch hẹn' value={stats.total} valueStyle={{ color: '#ec4899' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className='shadow-sm'>
                <Statistic title='Đang chờ xác nhận' value={stats.pending} valueStyle={{ color: '#f59e42' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className='shadow-sm'>
                <Statistic title='Đã chấp nhận' value={stats.confirmed} valueStyle={{ color: '#a855f7' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className='shadow-sm'>
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
              <Button
                type='primary'
                icon={<RefreshCw className='w-4 h-4' />}
                onClick={fetchBookings}
                className='bg-pink-500 hover:bg-pink-600 border-none'
              >
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className='shadow-sm'>
            <div className='py-20 flex flex-col items-center justify-center'>
              <Spin spinning={true} size='large' />
              <Text className='mt-4 text-gray-500'>Đang tải danh sách lịch đặt...</Text>
            </div>
          </Card>
        ) : !userInfo ? (
          <Card className='shadow-sm'>
            <div className='text-center py-20'>
              <User size={48} className='text-pink-300 mb-4' />
              <Title level={4} className='text-pink-700'>
                Bạn cần đăng nhập để xem lịch đặt tư vấn
              </Title>
              <Button type='primary' size='large' className='mt-4 bg-pink-500 hover:bg-pink-600 border-none'>
                Đăng nhập ngay
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Bộ lọc */}
            <Card className='mb-6 shadow-sm'>
              <div className='flex flex-wrap gap-4 items-center'>
                <Input
                  placeholder='Tìm kiếm theo tên...'
                  prefix={<Search className='w-4 h-4 text-pink-500' />}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />

                <Select
                  placeholder='Trạng thái'
                  style={{ minWidth: 150 }}
                  onChange={(value) => setStatusFilter(value)}
                  defaultValue='all'
                >
                  <Select.Option value='all'>Tất cả trạng thái</Select.Option>
                  <Select.Option value='pending'>
                    <Badge status='warning' text='Đang chờ' />
                  </Select.Option>
                  <Select.Option value='confirmed'>
                    <Badge status='success' text='Đã chấp nhận' />
                  </Select.Option>
                  <Select.Option value='cancelled'>
                    <Badge status='error' text='Đã từ chối' />
                  </Select.Option>
                </Select>

                <DatePicker
                  placeholder='Lọc theo ngày'
                  onChange={(date) => setDateFilter(date)}
                  format='DD/MM/YYYY'
                  allowClear
                  style={{ minWidth: 150 }}
                  suffixIcon={<Calendar className='w-4 h-4 text-pink-500' />}
                />
              </div>
            </Card>

            {/* Tabs: Tổng quan & Danh sách */}
            <Tabs
              defaultActiveKey='dashboard'
              type='card'
              className='booking-tabs'
              items={[
                {
                  key: 'dashboard',
                  label: (
                    <span className='flex items-center gap-1.5'>
                      <CalendarDays className='w-4 h-4 text-pink-500' /> Tổng quan
                    </span>
                  ),
                  children: (
                    <div className='py-4'>
                      <Row gutter={[16, 16]} className='mb-5'>
                        <Col xs={24} sm={12} md={6}>
                          <Card bordered={false} className='shadow-sm'>
                            <Statistic title='Tổng số lịch hẹn' value={stats.total} valueStyle={{ color: '#ec4899' }} />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card bordered={false} className='shadow-sm'>
                            <Statistic
                              title='Đang chờ xác nhận'
                              value={stats.pending}
                              valueStyle={{ color: '#f59e42' }}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card bordered={false} className='shadow-sm'>
                            <Statistic title='Đã chấp nhận' value={stats.confirmed} valueStyle={{ color: '#a855f7' }} />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <Card bordered={false} className='shadow-sm'>
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
                      <List className='w-4 h-4 text-pink-500' /> Danh sách
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
              ]}
            />
          </>
        )}
      </main>

      <Footer />

      <style jsx global>{`
        .booking-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }
        .booking-tabs .ant-tabs-tab {
          padding: 8px 16px;
          transition: all 0.3s;
        }
        .booking-tabs .ant-tabs-tab-active {
          background-color: #fbcfe8;
          border-bottom-color: #ec4899 !important;
        }
        .ant-table-row.bg-pink-50 {
          background-color: #fdf2f8;
        }
        .ant-card-head-title {
          padding: 12px 0;
        }
        .ant-btn-primary,
        .ant-btn-primary:focus {
          background: #ec4899;
          border-color: #ec4899;
        }
        .ant-btn-primary:hover {
          background: #db2777;
          border-color: #db2777;
        }
        .ant-btn-link {
          color: #ec4899;
        }
        .ant-btn-link:hover {
          color: #db2777;
        }
      `}</style>
    </div>
  )
}

export default ConsultantBookingSchedule
