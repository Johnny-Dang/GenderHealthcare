import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  Rate,
  Popconfirm,
  Typography,
  message,
  Statistic,
  Modal,
  Tabs
} from 'antd'
import { Trash2, Eye, Search, MessageSquare, Star } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../../../configs/axios'
import { useSelector } from 'react-redux'

const { Title } = Typography
const { Search: SearchInput } = Input
const { Option } = Select
const { TabPane } = Tabs

const ManagerFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [servicesList, setServicesList] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [stats, setStats] = useState({ total: 0, fiveStars: 0, average: 0 })
  const [monthlyRatingData, setMonthlyRatingData] = useState([])
  const userInfo = useSelector((state) => state.user?.userInfo)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/api/services/admin')
        const list = data.map((s) => ({ id: s.serviceId, name: s.serviceName }))
        setServicesList(list)
      } catch {
        message.error('Không thể tải danh sách dịch vụ.')
      }
    }
    fetchServices()
  }, [])

  useEffect(() => {
    if (selectedService) fetchFeedbacksByService(selectedService)
    else fetchFeedbacks()
  }, [selectedService])

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/Feedback')
      transformAndSet(data)
    } catch {
      message.error('Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFeedbacksByService = async (serviceId) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/Feedback/service/${serviceId}`)
      transformAndSet(data)
    } catch {
      message.error('Không thể tải đánh giá cho dịch vụ này.')
    } finally {
      setLoading(false)
    }
  }

  const transformAndSet = (data) => {
    const transformed = data.map((fb) => ({
      id: fb.feedbackId,
      customerName: fb.accountName,
      serviceName: fb.serviceName,
      rating: fb.rating,
      comment: fb.detail,
      date: new Date(fb.createdAt).toLocaleDateString('vi-VN'),
      createdAt: fb.createdAt
    }))
    setFeedbacks(transformed)
    const total = transformed.length
    const fiveStars = transformed.filter((f) => f.rating === 5).length
    const average = total ? parseFloat((transformed.reduce((a, b) => a + b.rating, 0) / total).toFixed(1)) : 0
    setStats({ total, fiveStars, average })

    // Generate monthly rating data for chart
    generateMonthlyRatingData(transformed)
  }

  // Tạo dữ liệu biểu đồ rating theo tháng
  const generateMonthlyRatingData = (feedbackData) => {
    // Khởi tạo dữ liệu cho 12 tháng
    const monthlyData = Array(12)
      .fill()
      .map((_, idx) => ({
        month: `T${idx + 1}`,
        averageRating: 0,
        count: 0,
        totalRating: 0
      }))

    // Tính tổng rating và số lượng feedback theo tháng
    feedbackData.forEach((feedback) => {
      if (!feedback.createdAt) return

      const date = new Date(feedback.createdAt)
      const monthIndex = date.getMonth() // 0-11

      monthlyData[monthIndex].count += 1
      monthlyData[monthIndex].totalRating += feedback.rating
    })

    // Tính rating trung bình cho mỗi tháng
    monthlyData.forEach((month) => {
      if (month.count > 0) {
        month.averageRating = parseFloat((month.totalRating / month.count).toFixed(1))
      }
    })

    setMonthlyRatingData(monthlyData)
  }

  const handleSearch = (value) => setSearchText(value)
  const handleServiceChange = (value) => setSelectedService(value || null)

  const handleDelete = async (id) => {
    if (!userInfo?.accessToken) {
      message.error('Bạn cần đăng nhập để thực hiện chức năng này')
      return
    }
    message.loading({ content: 'Đang xóa đánh giá...', key: 'deleting' })
    try {
      await api.delete(`/api/Feedback/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.accessToken}` }
      })
      const updated = feedbacks.filter((f) => f.id !== id)
      setFeedbacks(updated)
      const total = updated.length
      const fiveStars = updated.filter((f) => f.rating === 5).length
      const avgValue = total ? parseFloat((updated.reduce((a, b) => a + b.rating, 0) / total).toFixed(1)) : 0
      setStats({ total, fiveStars, average: avgValue })
      generateMonthlyRatingData(updated)
      message.success({ content: 'Xóa đánh giá thành công!', key: 'deleting', duration: 2 })
    } catch (error) {
      message.error({ content: 'Xóa đánh giá thất bại! Vui lòng thử lại.', key: 'deleting', duration: 2 })
    }
  }

  const showDetailModal = (feedback) => {
    setSelectedFeedback(feedback)
    setDetailModalVisible(true)
  }

  const closeDetailModal = () => setDetailModalVisible(false)

  const filtered = feedbacks.filter((item) =>
    (item.customerName + item.comment + item.serviceName).toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName', render: (text) => <a>{text}</a> },
    { title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (r) => <Rate disabled defaultValue={r} />,
      sorter: (a, b) => a.rating - b.rating
    },
    { title: 'Nhận xét', dataIndex: 'comment', key: 'comment', ellipsis: true },
    { title: 'Ngày', dataIndex: 'date', key: 'date', sorter: (a, b) => new Date(a.date) - new Date(b.date) },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            className='bg-pink-300 hover:bg-pink-600 transition-all duration-300 hover:shadow-md'
            size='small'
            icon={<Eye size={14} />}
            onClick={() => showDetailModal(record)}
          >
            Chi tiết
          </Button>
          <Popconfirm
            title='Xác nhận xóa đánh giá'
            description={`Bạn có chắc chắn muốn xóa đánh giá của "${record.customerName}" không? Hành động này không thể hoàn tác.`}
            onConfirm={() => handleDelete(record.id)}
            okText='Xóa'
            cancelText='Hủy'
            okType='danger'
          >
            <Button
              className='bg-red-300 hover:bg-red-600 transition-all duration-300 hover:shadow-md'
              danger
              size='small'
              icon={<Trash2 size={14} />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className='bg-gradient-to-br from-pink-50 via-white to-pink-50 p-6 rounded-lg shadow-sm min-h-screen'>
      <div className='flex justify-between items-center mb-6 bg-gradient-to-r from-pink-100 to-pink-50 p-4 rounded-lg shadow-sm'>
        <Title level={4} className='transition-all duration-300 hover:text-pink-600 hover:translate-x-1 mb-0'>
          Quản lý Feedback
        </Title>
        <Space>
          <Select
            placeholder='Chọn dịch vụ'
            style={{ width: 200 }}
            allowClear
            onChange={handleServiceChange}
            value={selectedService}
          >
            <Option value={null}>Tất cả</Option>
            {servicesList.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.name}
              </Option>
            ))}
          </Select>
          <Button
            type='primary'
            onClick={() => (selectedService ? fetchFeedbacksByService(selectedService) : fetchFeedbacks())}
            className='bg-pink-500 hover:bg-pink-600 transition-all duration-300 hover:shadow-md'
          >
            Lọc
          </Button>
          <Button
            onClick={() => {
              setSearchText('')
              setSelectedService(null)
              fetchFeedbacks()
            }}
          >
            Reset
          </Button>
          <SearchInput
            placeholder='Tìm kiếm...'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search />}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </div>

      <Tabs defaultActiveKey='statistics' className='mb-6'>
        <TabPane tab='Thống kê đánh giá' key='statistics'>
          <div className='grid grid-cols-3 gap-4 mb-6'>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-pink-400 bg-white'>
              <Statistic
                title='Tổng đánh giá'
                value={stats.total}
                valueStyle={{ color: '#3f8600' }}
                prefix={<MessageSquare size={18} className='text-pink-500 animate-pulse' />}
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-yellow-400 bg-white'>
              <Statistic
                title='5 sao'
                value={stats.fiveStars}
                valueStyle={{ color: 'orange' }}
                prefix={<Star size={18} className='text-yellow-500 animate-pulse fill-yellow-500' />}
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
            <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-blue-400 bg-white'>
              <Statistic
                title='Trung bình'
                value={stats.average}
                suffix='/5'
                precision={1}
                valueStyle={{ color: 'blue' }}
                prefix={<Star size={18} className='text-blue-500 animate-pulse' />}
                className='transition-all duration-300 hover:scale-105'
              />
            </Card>
          </div>
          <Card
            title='Biểu đồ đánh giá trung bình theo tháng'
            className='bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-pink-100'
          >
            <ResponsiveContainer width='100%' height={400}>
              <LineChart data={monthlyRatingData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis domain={[0, 5]} />
                <Tooltip formatter={(value) => `${value} sao`} />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='averageRating'
                  name='Đánh giá trung bình'
                  stroke='#8884d8'
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <div className='mt-6 grid grid-cols-3 gap-4'>
            {monthlyRatingData
              .filter((item) => item.count > 0)
              .map((month, index) => (
                <Card
                  key={index}
                  size='small'
                  title={`${month.month}`}
                  className='hover:shadow-md transition-all duration-300 hover:border-pink-300 bg-white'
                >
                  <p>
                    <strong>Đánh giá trung bình:</strong> {month.averageRating}/5
                  </p>
                  <p>
                    <strong>Số lượng đánh giá:</strong> {month.count}
                  </p>
                </Card>
              ))}
          </div>
        </TabPane>

        <TabPane tab='Danh sách đánh giá' key='feedbackList'>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey='id'
            loading={loading}
            pagination={{ pageSize: 10, showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá` }}
            scroll={{ x: 'max-content' }}
            className='bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md'
            rowClassName={() => 'transition-all duration-300 hover:bg-pink-50'}
          />
        </TabPane>
      </Tabs>

      <Modal
        title='Chi tiết đánh giá'
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button
            key='back'
            onClick={closeDetailModal}
            className='transition-all duration-300 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-400 hover:shadow-md'
          >
            Đóng
          </Button>
        ]}
        width={700}
        className='transition-all duration-500 bg-gradient-to-r from-pink-50 to-indigo-50'
        bodyStyle={{ backgroundColor: '#fff5f8', borderRadius: '8px', padding: '20px' }}
      >
        {selectedFeedback && (
          <div>
            <p>
              <strong>Khách hàng:</strong> {selectedFeedback.customerName}
            </p>
            <p>
              <strong>Dịch vụ:</strong> {selectedFeedback.serviceName}
            </p>
            <p>
              <strong>Đánh giá:</strong> <Rate disabled defaultValue={selectedFeedback.rating} />
            </p>
            <p>
              <strong>Ngày:</strong> {selectedFeedback.date}
            </p>
            <p>
              <strong>Nhận xét:</strong> {selectedFeedback.comment}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManagerFeedbackManagement
