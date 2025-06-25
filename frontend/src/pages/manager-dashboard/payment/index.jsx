import React, { useState, useEffect } from 'react'
import { Table, Card, Space, Button, Input, Typography, Tag, Statistic, DatePicker, Tabs, Select, Row, Col } from 'antd'
import { Search, Download, FileText, Eye, TrendingUp, CreditCard, DollarSign, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

  // Mock data for demonstration
  useEffect(() => {
    // In a real application, you'd fetch this from your API
    const mockPayments = [
      {
        id: 'PAY-001',
        customerName: 'Nguyễn Văn A',
        serviceName: 'Khám sức khỏe tổng quát',
        amount: 2500000,
        status: 'completed',
        paymentMethod: 'VNPay',
        date: '2023-09-15'
      },
      {
        id: 'PAY-002',
        customerName: 'Trần Thị B',
        serviceName: 'Tư vấn dinh dưỡng',
        amount: 1200000,
        status: 'completed',
        paymentMethod: 'Momo',
        date: '2023-09-14'
      },
      {
        id: 'PAY-003',
        customerName: 'Lê Văn C',
        serviceName: 'Xét nghiệm máu',
        amount: 1800000,
        status: 'pending',
        paymentMethod: 'Bank Transfer',
        date: '2023-09-13'
      },
      {
        id: 'PAY-004',
        customerName: 'Phạm Thị D',
        serviceName: 'Khám phụ khoa',
        amount: 2200000,
        status: 'completed',
        paymentMethod: 'VNPay',
        date: '2023-09-12'
      },
      {
        id: 'PAY-005',
        customerName: 'Hoàng Văn E',
        serviceName: 'Tư vấn sức khỏe sinh sản',
        amount: 1500000,
        status: 'failed',
        paymentMethod: 'Credit Card',
        date: '2023-09-11'
      }
    ]

    setPayments(mockPayments)
    setLoading(false)
  }, [])

  // Monthly revenue data for chart
  const monthlyRevenueData = [
    { name: 'T1', revenue: 35000000 },
    { name: 'T2', revenue: 42000000 },
    { name: 'T3', revenue: 38000000 },
    { name: 'T4', revenue: 45000000 },
    { name: 'T5', revenue: 52000000 },
    { name: 'T6', revenue: 48000000 },
    { name: 'T7', revenue: 56000000 },
    { name: 'T8', revenue: 51000000 },
    { name: 'T9', revenue: 45200000 }
  ]

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleDateRangeChange = (dates) => {
    setDateRange(dates)
  }

  const handleStatusFilter = (value) => {
    setFilterStatus(value)
  }

  const exportToExcel = () => {
    // In a real application, you'd implement an Excel export here
    console.log('Exporting to Excel...')
  }

  const filteredPayments = payments.filter((payment) => {
    // Filter by search text
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.serviceName.toLowerCase().includes(searchText.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchText.toLowerCase())

    // Filter by status
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus

    // Filter by date range
    let matchesDateRange = true
    if (dateRange[0] && dateRange[1]) {
      const paymentDate = new Date(payment.date)
      const startDate = dateRange[0].startOf('day').toDate()
      const endDate = dateRange[1].endOf('day').toDate()
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
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName'
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
      ),
      filters: [
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đang xử lý', value: 'pending' },
        { text: 'Thất bại', value: 'failed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='primary' size='small' icon={<Eye size={14} />}>
            Chi tiết
          </Button>
          <Button size='small' icon={<FileText size={14} />}>
            Hoá đơn
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <Title level={4}>Quản lý Thanh toán</Title>
        <Space>
          <Button type='primary' icon={<Download size={16} />} onClick={exportToExcel}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey='statistics' className='mb-6'>
        <TabPane tab='Thống kê' key='statistics'>
          <div className='grid grid-cols-4 gap-4 mb-6'>
            <Card>
              <Statistic
                title='Tổng doanh thu'
                value={payments.reduce((sum, item) => sum + (item.status === 'completed' ? item.amount : 0), 0)}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarSign size={18} />}
                suffix='VND'
              />
            </Card>
            <Card>
              <Statistic
                title='Số giao dịch'
                value={payments.length}
                valueStyle={{ color: '#1677ff' }}
                prefix={<CreditCard size={18} />}
              />
            </Card>
            <Card>
              <Statistic
                title='Đơn thành công'
                value={payments.filter((p) => p.status === 'completed').length}
                valueStyle={{ color: '#52c41a' }}
                prefix={<TrendingUp size={18} />}
                suffix={`/ ${payments.length}`}
              />
            </Card>
            <Card>
              <Statistic
                title='Đơn đang xử lý'
                value={payments.filter((p) => p.status === 'pending').length}
                valueStyle={{ color: '#faad14' }}
                prefix={<Calendar size={18} />}
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
            <SearchInput
              placeholder='Tìm kiếm thanh toán...'
              onSearch={handleSearch}
              style={{ width: 300 }}
              prefix={<Search size={16} />}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <RangePicker onChange={handleDateRangeChange} style={{ width: 300 }} />

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
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default PaymentManagement
