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
      console.log('Fetching feedbacks...')
      const response = await api.get('/api/Feedback')
      console.log('Feedback data:', response.data)

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

  const handleDelete = (id) => {
    const feedbackToDelete = feedbacks.find((item) => item.id === id)
    if (!feedbackToDelete) {
      message.error('Không tìm thấy đánh giá này')
      return
    }

    Modal.confirm({
      title: 'Xác nhận xoá',
      content: `Bạn có chắc chắn muốn xoá đánh giá của "${feedbackToDelete.customerName}" không?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      async onOk() {
        try {
          // Kiểm tra token trước khi gọi API
          const token = localStorage.getItem('token')
          if (!token) {
            message.error('Bạn cần đăng nhập để thực hiện chức năng này')
            return
          }

          console.log(`🗑️ Deleting feedback with ID: ${id}`)
          console.log(`URL: ${api.defaults.baseURL}/api/Feedback/${id}`)

          // Hiển thị loading message
          const loadingMessage = message.loading('Đang xoá đánh giá...', 0)

          try {
            // Gọi API DELETE với headers rõ ràng để đảm bảo token được gửi đi
            const response = await api.delete(`/api/Feedback/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            console.log('✅ Delete response:', response)

            // Đóng loading message
            loadingMessage()

            // Cập nhật danh sách feedback sau khi xóa
            const updatedFeedbacks = feedbacks.filter((item) => item.id !== id)
            setFeedbacks(updatedFeedbacks)

            // Cập nhật thống kê
            const newTotal = stats.total - 1
            const newFiveStars = feedbackToDelete.rating === 5 ? stats.fiveStars - 1 : stats.fiveStars
            const newAverage = newTotal > 0 ? (stats.average * stats.total - feedbackToDelete.rating) / newTotal : 0

            setStats({
              total: newTotal,
              fiveStars: newFiveStars,
              average: parseFloat(newAverage.toFixed(1))
            })

            message.success('Đã xoá đánh giá thành công')
          } catch (apiError) {
            console.error('❌ API Error:', apiError)

            if (apiError.response) {
              console.error('Response status:', apiError.response.status)
              console.error('Response data:', apiError.response.data)

              // Xử lý các trường hợp lỗi HTTP
              if (apiError.response.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
                setTimeout(() => {
                  localStorage.removeItem('token')
                  window.location.href = '/login'
                }, 2000)
              } else if (apiError.response.status === 403) {
                message.error('Bạn không có quyền xóa đánh giá này')
              } else if (apiError.response.status === 404) {
                message.error('Đánh giá không tồn tại hoặc đã bị xoá trước đó')
                // Xóa khỏi UI nếu không tồn tại trên server
                setFeedbacks(feedbacks.filter((item) => item.id !== id))
              } else {
                message.error(
                  `Lỗi khi xoá đánh giá: ${apiError.response.statusText || 'Lỗi không xác định'} (${apiError.response.status})`
                )
              }
            } else if (apiError.request) {
              console.error('No response received:', apiError.request)
              message.error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.')
            } else {
              console.error('Error message:', apiError.message)
              message.error(`Lỗi: ${apiError.message}`)
            }

            loadingMessage() // Đảm bảo đóng loading message nếu có lỗi
          }
        } catch (error) {
          console.error('❌ Unexpected error:', error)
          message.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc khởi động lại backend.')

          // Hỏi người dùng có muốn xóa khỏi UI không
          Modal.confirm({
            title: 'Lỗi kết nối',
            content: 'Không thể kết nối đến server. Bạn có muốn xóa đánh giá này khỏi giao diện (chỉ UI)?',
            onOk: () => {
              setFeedbacks(feedbacks.filter((item) => item.id !== id))
              message.warning('Đã xóa đánh giá khỏi giao diện (dữ liệu trên server không bị ảnh hưởng)')
            }
          })
        }
      }
    })
  }

  const handleUpdateFeedback = async (id, detail, rating) => {
    try {
      await api.put('/api/Feedback', {
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
              <Button
                danger
                icon={<Trash2 size={14} />}
                onClick={() => {
                  handleDelete(selectedFeedback.id)
                  closeDetailModal()
                }}
              >
                Xóa đánh giá
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManagerFeedbackManagement
