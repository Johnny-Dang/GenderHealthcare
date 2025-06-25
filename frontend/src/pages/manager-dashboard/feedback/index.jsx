import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Rate,
  Popconfirm,
  Typography,
  message,
  Tag,
  Statistic,
  Modal,
  Descriptions,
  Avatar,
  Image,
  Divider,
  Dropdown
} from 'antd'
import { Search, Trash2, Check, X, Eye, User, Calendar, MessageSquare, MoreVertical } from 'lucide-react'
import api from '../../../configs/axios'

const { Title, Text, Paragraph } = Typography
const { Search: SearchInput } = Input

const ManagerFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    fiveStars: 0,
    average: 0
  })

  // Fetch data from API
  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const response = await api.get('api/Feedback')

      // Transform API response to match component structure
      const transformedFeedbacks = response.data.map((feedback) => ({
        id: feedback.feedbackId,
        customerName: feedback.accountName,
        serviceName: feedback.serviceName,
        rating: feedback.rating,
        comment: feedback.detail,
        date: new Date(feedback.createdAt).toLocaleDateString('vi-VN'),
        createdAt: feedback.createdAt,
        serviceId: feedback.serviceId,
        accountId: feedback.accountId
      }))

      setFeedbacks(transformedFeedbacks)

      // Calculate statistics
      const total = transformedFeedbacks.length
      const fiveStars = transformedFeedbacks.filter((f) => f.rating === 5).length
      const average = total > 0 ? transformedFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total : 0

      setStats({
        total,
        fiveStars,
        average: parseFloat(average.toFixed(1))
      })
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      message.error('Không thể tải dữ liệu đánh giá. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`api/Feedback/${id}`)
      setFeedbacks(feedbacks.filter((item) => item.id !== id))
      message.success('Đã xoá đánh giá thành công')

      // Update statistics
      const newTotal = stats.total - 1
      const deletedFeedback = feedbacks.find((f) => f.id === id)
      const newFiveStars = deletedFeedback.rating === 5 ? stats.fiveStars - 1 : stats.fiveStars
      const newAverage = newTotal > 0 ? (stats.average * stats.total - deletedFeedback.rating) / newTotal : 0

      setStats({
        total: newTotal,
        fiveStars: newFiveStars,
        average: parseFloat(newAverage.toFixed(1))
      })
    } catch (error) {
      console.error('Error deleting feedback:', error)
      message.error('Không thể xóa đánh giá. Vui lòng thử lại sau.')
    }
  }

  const handleUpdateFeedback = async (id, detail, rating) => {
    try {
      await api.put('api/Feedback', {
        feedbackId: id,
        detail: detail,
        rating: rating
      })

      message.success('Cập nhật đánh giá thành công')
      fetchFeedbacks() // Refresh data after update
    } catch (error) {
      console.error('Error updating feedback:', error)
      message.error('Không thể cập nhật đánh giá. Vui lòng thử lại sau.')
    }
  }

  const showDetailModal = (feedback) => {
    setSelectedFeedback(feedback)
    setDetailModalVisible(true)
  }

  const closeDetailModal = () => {
    setDetailModalVisible(false)
  }

  const filteredFeedbacks = feedbacks.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchText.toLowerCase()) ||
      item.serviceName.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName'
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} />,
      sorter: (a, b) => a.rating - b.rating
    },
    {
      title: 'Nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date)
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size='middle'>
          <Button type='default' size='small' icon={<Eye size={14} />} onClick={() => showDetailModal(record)}>
            Chi tiết
          </Button>
          <Popconfirm
            title='Xóa đánh giá này?'
            description='Bạn có chắc chắn muốn xóa đánh giá này không?'
            onConfirm={() => handleDelete(record.id)}
            okText='Có'
            cancelText='Không'
          >
            <Button danger size='small' icon={<Trash2 size={14} />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <Title level={4}>Quản lý Feedback</Title>
        <Space>
          <Button type='primary' onClick={fetchFeedbacks}>
            Làm mới
          </Button>
          <SearchInput
            placeholder='Tìm kiếm đánh giá...'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Space>
      </div>

      <div className='grid grid-cols-3 gap-4 mb-6'>
        <Card>
          <Statistic title='Tổng số đánh giá' value={stats.total} valueStyle={{ color: '#1677ff' }} />
        </Card>
        <Card>
          <Statistic title='Đánh giá 5 sao' value={stats.fiveStars} valueStyle={{ color: '#3f8600' }} />
        </Card>
        <Card>
          <Statistic
            title='Đánh giá trung bình'
            value={stats.average}
            precision={1}
            valueStyle={{ color: '#722ed1' }}
            suffix='/ 5'
          />
        </Card>
      </div>

      <Table
        columns={columns}
        dataSource={filteredFeedbacks}
        rowKey='id'
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* Chi tiết đánh giá Modal */}
      <Modal
        title='Chi tiết đánh giá'
        open={detailModalVisible}
        onCancel={closeDetailModal}
        footer={[
          <Button key='back' onClick={closeDetailModal}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedFeedback && (
          <div>
            <div className='flex items-center mb-4'>
              <Avatar size={64} icon={<User />} className='mr-4' style={{ backgroundColor: '#1677ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {selectedFeedback.customerName}
                </Title>
                <div className='flex items-center'>
                  <Rate disabled value={selectedFeedback.rating} />
                  <Text type='secondary' className='ml-2'>
                    ({selectedFeedback.rating}/5)
                  </Text>
                </div>
              </div>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label='Dịch vụ'>{selectedFeedback.serviceName}</Descriptions.Item>
              <Descriptions.Item label='Thời gian'>
                <div className='flex items-center'>
                  <Calendar size={16} className='mr-2' />
                  {new Date(selectedFeedback.createdAt).toLocaleString('vi-VN')}
                </div>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation='left'>Nội dung đánh giá</Divider>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-start'>
                <MessageSquare size={20} className='mr-2 mt-1 text-blue-500' />
                <Paragraph style={{ margin: 0 }}>{selectedFeedback.comment}</Paragraph>
              </div>
            </div>

            <Divider />

            <div className='flex justify-end'>
              <Popconfirm
                title='Xóa đánh giá này?'
                description='Bạn có chắc chắn muốn xóa đánh giá này không?'
                onConfirm={() => {
                  handleDelete(selectedFeedback.id)
                  closeDetailModal()
                }}
                okText='Có'
                cancelText='Không'
              >
                <Button danger icon={<Trash2 size={14} />}>
                  Xóa đánh giá
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManagerFeedbackManagement
