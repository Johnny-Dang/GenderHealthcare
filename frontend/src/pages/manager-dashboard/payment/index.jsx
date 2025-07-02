import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Typography,
  Tag,
  Statistic,
  DatePicker,
  Tabs,
  Select,
  Row,
  Col,
  message,
  Modal
} from 'antd'
import { Search, Download, FileText, Eye, TrendingUp, CreditCard, DollarSign, Calendar, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../../../configs/axios'

const { Title, Text } = Typography
const { Search: SearchInput } = Input
const { RangePicker } = DatePicker
const { TabPane } = Tabs

const PaymentManagement = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState([null, null])
  const [filterStatus, setFilterStatus] = useState('all')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([])

  // Fetch payment data from API
  const fetchPayments = async () => {
    setLoading(true)
    try {
      console.log('Fetching payments from API...')
      const response = await api.get('/api/payments/with-booking-info')
      console.log('API Response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        const transformedPayments = await Promise.all(
          response.data.map(async (payment) => {
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
              bookingId: payment.bookingId,
              customerName: `${payment.firstName} ${payment.lastName}`,
              serviceName: serviceName,
              amount: payment.amount,
              paymentMethod: payment.paymentMethod,
              date: new Date(payment.createAt).toISOString().split('T')[0],
              status: 'completed', // Assume all payments in DB are successful
              phone: payment.phone,
              email: payment.email,
              gender: payment.gender
            }
          })
        )

        setPayments(transformedPayments)

        // Generate chart data from actual payments
        generateMonthlyRevenueData(transformedPayments)

        message.success(`Đã tải ${transformedPayments.length} thanh toán từ hệ thống`)
      } else {
        console.error('Unexpected API response format:', response.data)
        setPayments([])
        setMonthlyRevenueData([])
        message.error('Dữ liệu API không đúng định dạng')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      console.error('Error details:', error.response?.data)
      setPayments([])
      setMonthlyRevenueData([])
      message.error('Không thể kết nối tới API. Vui lòng kiểm tra kết nối hoặc thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Tạo dữ liệu biểu đồ từ dữ liệu thanh toán thực tế
  const generateMonthlyRevenueData = (paymentData) => {
    const months = {
      T1: 0,
      T2: 0,
      T3: 0,
      T4: 0,
      T5: 0,
      T6: 0,
      T7: 0,
      T8: 0,
      T9: 0,
      T10: 0,
      T11: 0,
      T12: 0
    }

    // Tính tổng doanh thu theo tháng
    paymentData.forEach((payment) => {
      if (!payment.date) return

      const date = new Date(payment.date)
      const monthIndex = date.getMonth() // 0-11
      const monthKey = `T${monthIndex + 1}`

      if (payment.status === 'completed') {
        months[monthKey] += payment.amount
      }
    })

    // Chuyển đổi sang định dạng biểu đồ
    const chartData = Object.entries(months).map(([name, revenue]) => ({
      name,
      revenue
    }))

    setMonthlyRevenueData(chartData)
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleDateRangeChange = (dates) => {
    console.log('Date range selected:', dates)
    setDateRange(dates)
  }

  const handleStatusFilter = (value) => {
    setFilterStatus(value)
  }

  const showPaymentDetail = async (payment) => {
    try {
      // Lấy chi tiết thanh toán từ API
      const detailResponse = await api.get(`/api/payments/transaction/${payment.id}`)

      // Lấy thông tin dịch vụ từ booking details API (if not already present)
      let serviceName = payment.serviceName || 'N/A'
      if (serviceName === 'N/A') {
        try {
          const bookingDetailsResponse = await api.get(`/api/booking-details/booking/${payment.bookingId}`)
          if (
            bookingDetailsResponse.data &&
            Array.isArray(bookingDetailsResponse.data) &&
            bookingDetailsResponse.data.length > 0
          ) {
            serviceName = bookingDetailsResponse.data[0].testServiceName || 'N/A'
          }
        } catch (error) {
          console.error('Error fetching booking details:', error)
        }
      }

      setSelectedPayment({
        ...payment,
        details: detailResponse.data,
        serviceName: serviceName
      })
    } catch (error) {
      console.error('Error fetching payment details:', error)
      setSelectedPayment(payment)
    }
    setDetailModalVisible(true)
  }

  const exportToExcel = () => {
    // Prepare CSV data
    const headers = [
      'Mã thanh toán',
      'Mã đặt hàng',
      'Dịch vụ',
      'Số tiền',
      'Phương thức',
      'Ngày thanh toán',
      'Trạng thái'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredPayments.map((payment) =>
        [
          payment.id,
          payment.bookingId,
          `"${payment.serviceName || 'N/A'}"`, // Quotes để xử lý dấu phẩy trong tên dịch vụ
          payment.amount,
          payment.paymentMethod,
          payment.date,
          payment.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'
        ].join(',')
      )
    ].join('\n')

    // Tạo và tải file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `thanh-toan-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success('Đã xuất báo cáo thành công')
  }

  // Lọc thanh toán dựa trên các tiêu chí
  const filteredPayments = payments.filter((payment) => {
    // Nếu tìm kiếm chính xác mã thanh toán, trả về ngay lập tức
    if (payment.id && searchText && payment.id === searchText) {
      return true
    }

    // Lọc theo text tìm kiếm
    const matchesSearch =
      (payment.id && payment.id.toLowerCase().includes(searchText.toLowerCase())) ||
      (payment.bookingId && payment.bookingId.toString().toLowerCase().includes(searchText.toLowerCase()))
    /* Comment tạm tìm kiếm theo khách hàng và dịch vụ
      ||
      (payment.customerName && payment.customerName.toLowerCase().includes(searchText.toLowerCase())) ||
      (payment.serviceName && payment.serviceName.toLowerCase().includes(searchText.toLowerCase()))
      */

    // Lọc theo trạng thái
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus

    // Lọc theo khoảng thời gian
    let matchesDateRange = true
    if (dateRange && dateRange[0] && dateRange[1]) {
      if (!payment.date) return false

      // Convert strings to Date objects for comparison
      const paymentDate = new Date(payment.date)
      // Extract just the date part from dateRange Moment objects
      const startDate = dateRange[0].startOf('day').toDate()
      const endDate = dateRange[1].endOf('day').toDate()

      console.log('Comparing dates:', {
        paymentDate,
        startDate,
        endDate,
        match: paymentDate >= startDate && paymentDate <= endDate
      })

      matchesDateRange = paymentDate >= startDate && paymentDate <= endDate
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const statusColors = {
    completed: 'green',
    pending: 'orange',
    failed: 'red'
  }

  const columns = [
    {
      title: 'Mã thanh toán',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{text}</a>,
      width: 200
    },

    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 200
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>
          {status === 'completed' ? 'Hoàn thành' : status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='primary' size='small' icon={<Eye size={14} />} onClick={() => showPaymentDetail(record)}>
            Chi tiết
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className='bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6 rounded-lg shadow-sm min-h-screen'>
      <div className='flex justify-between items-center mb-6 bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-lg shadow-sm'>
        <Title level={4} className='transition-all duration-300 hover:text-blue-600 hover:translate-x-1 mb-0'>
          Quản lý Thanh toán
        </Title>
        <Space>
          <Button icon={<RefreshCw size={16} />} onClick={fetchPayments}>
            Làm mới
          </Button>
          <Button type='primary' icon={<Download size={16} />} onClick={exportToExcel}>
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey='statistics' className='mb-6'>
        <TabPane tab='Thống kê' key='statistics'>
          <div className='grid grid-cols-4 gap-4 mb-6'>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-blue-400 bg-white'>
              <Statistic
                title='Tổng doanh thu'
                value={payments.reduce((sum, item) => sum + (item.status === 'completed' ? item.amount : 0), 0)}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarSign size={18} className='text-blue-500 animate-pulse' />}
                suffix='VND'
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-indigo-400 bg-white'>
              <Statistic
                title='Số giao dịch'
                value={payments.length}
                valueStyle={{ color: '#1677ff' }}
                prefix={<CreditCard size={18} className='text-indigo-500 animate-pulse' />}
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-green-400 bg-white'>
              <Statistic
                title='Đơn thành công'
                value={payments.filter((p) => p.status === 'completed').length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<TrendingUp size={18} className='text-green-500 animate-pulse' />}
                suffix={`/ ${payments.length}`}
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-yellow-400 bg-white'>
              <Statistic
                title='Đơn đang xử lý'
                value={payments.filter((p) => p.status === 'pending').length}
                valueStyle={{ color: '#faad14' }}
                prefix={<Calendar size={18} className='text-yellow-500 animate-pulse' />}
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
          </div>

          <Card title='Biểu đồ doanh thu theo tháng' className='mb-6'>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
                <Legend />
                <Bar dataKey='revenue' name='Doanh thu' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        <TabPane tab='Danh sách thanh toán' key='paymentList'>
          <div className='mb-6 flex flex-wrap gap-4'>
            <div className='flex flex-col'>
              <SearchInput
                placeholder='Tìm kiếm theo mã thanh toán hoặc mã đặt hàng...'
                onSearch={handleSearch}
                style={{ width: 300 }}
                prefix={<Search size={16} />}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <div className='text-xs text-gray-500 mt-1'>* Nhập chính xác mã thanh toán để tìm kiếm nhanh</div>
            </div>

            <RangePicker
              onChange={handleDateRangeChange}
              style={{ width: 300 }}
              format='DD/MM/YYYY'
              placeholder={['Từ ngày', 'Đến ngày']}
            />

            <Select
              defaultValue='all'
              style={{ width: 200 }}
              onChange={handleStatusFilter}
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'completed', label: 'Hoàn thành' },
                { value: 'pending', label: 'Đang xử lý' },
                { value: 'failed', label: 'Thất bại' }
              ]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredPayments}
            rowKey='id'
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thanh toán`
            }}
            bordered
          />
        </TabPane>
      </Tabs>

      {/* Payment Detail Modal */}
      <Modal
        title='Chi tiết thanh toán'
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key='close' onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedPayment && (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Text strong>Mã thanh toán:</Text>
                <div>{selectedPayment.id}</div>
              </div>
              <div>
                <Text strong>Mã đặt hàng:</Text>
                <div>{selectedPayment.bookingId}</div>
              </div>
              <div>
                <Text strong>Khách hàng:</Text>
                <div>{selectedPayment.customerName}</div>
              </div>
              <div>
                <Text strong>Email:</Text>
                <div>{selectedPayment.email}</div>
              </div>
              <div>
                <Text strong>Số điện thoại:</Text>
                <div>{selectedPayment.phone}</div>
              </div>
              <div>
                <Text strong>Giới tính:</Text>
                <div>{selectedPayment.gender ? 'Nam' : 'Nữ'}</div>
              </div>
              <div>
                <Text strong>Dịch vụ:</Text>
                <div>{selectedPayment.serviceName}</div>
              </div>
              <div>
                <Text strong>Số tiền:</Text>
                <div>{selectedPayment.amount.toLocaleString('vi-VN')}đ</div>
              </div>
              <div>
                <Text strong>Phương thức:</Text>
                <div>{selectedPayment.paymentMethod}</div>
              </div>
              <div>
                <Text strong>Ngày thanh toán:</Text>
                <div>{selectedPayment.date}</div>
              </div>
              <div>
                <Text strong>Trạng thái:</Text>
                <div>
                  <Tag color={statusColors[selectedPayment.status]}>
                    {selectedPayment.status === 'completed'
                      ? 'Hoàn thành'
                      : selectedPayment.status === 'pending'
                        ? 'Đang xử lý'
                        : 'Thất bại'}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PaymentManagement
