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
  Modal,
  Form,
  InputNumber,
  Select,
  Row,
  Col,
  Upload,
  message,
  Switch
} from 'antd'
import {
  Search,
  PlusSquare,
  Edit,
  Trash2,
  Image,
  Package,
  FilePlus,
  DollarSign,
  PieChart,
  Stethoscope
} from 'lucide-react'
// Removed unused UploadOutlined import
import api from '../../../configs/axios'

const { Title, Text, Paragraph } = Typography
const { Search: SearchInput } = Input
const { TextArea } = Input
const { Option } = Select

const TestServiceManagement = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form] = Form.useForm()
  // Removed unused image preview states

  // Fetch data from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const response = await api.get('api/services')

        // Transform the API response to match our component's data structure
        const transformedServices = response.data.map((service) => ({
          id: service.serviceId,
          name: service.serviceName,
          description: service.description,
          price: service.price,
          category: service.category,
          imageUrl: service.imageUrl || 'https://example.com/default-service.jpg',
          status: 'active', // Default status since API doesn't provide this
          duration: 30, // Default duration since API doesn't provide this
          preparation: 'Liên hệ nhân viên để biết thêm chi tiết', // Default preparation
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }))

        setServices(transformedServices)
      } catch (error) {
        console.error('Error fetching services:', error)
        message.error('Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const showModal = (service = null) => {
    setEditingService(service)
    if (service) {
      form.setFieldsValue({
        name: service.name,
        description: service.description,
        price: service.price,
        category: service.category,
        enabled: service.status === 'active',
        duration: service.duration,
        preparation: service.preparation,
        imageUrl: service.imageUrl
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        status: 'active',
        enabled: true
      })
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  // Remove unused image preview functions

  const handleSubmit = async (values) => {
    const status = values.enabled ? 'active' : 'inactive'
    delete values.enabled

    try {
      if (editingService) {
        // Update existing service
        const requestData = {
          id: editingService.id,
          serviceName: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          imageUrl: values.imageUrl || editingService.imageUrl
        }

        await api.put(`api/services/${editingService.id}`, requestData)

        // Update local state
        setServices(
          services.map((service) =>
            service.id === editingService.id
              ? {
                  ...service,
                  name: values.name,
                  description: values.description,
                  price: values.price,
                  category: values.category,
                  status,
                  imageUrl: values.imageUrl || service.imageUrl
                }
              : service
          )
        )

        message.success('Cập nhật dịch vụ thành công')
      } else {
        // Add new service
        const requestData = {
          serviceName: values.name,
          description: values.description,
          price: values.price,
          category: values.category,
          imageUrl: values.imageUrl || 'https://example.com/default-service.jpg'
        }

        const response = await api.post('api/services', requestData)
        const newService = {
          id: response.data.serviceId,
          name: response.data.serviceName,
          description: response.data.description,
          price: response.data.price,
          category: response.data.category,
          status,
          imageUrl: response.data.imageUrl || 'https://example.com/default-service.jpg',
          duration: 30, // Default value
          preparation: 'Liên hệ nhân viên để biết thêm chi tiết',
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        }

        setServices([...services, newService])
        message.success('Thêm dịch vụ thành công')
      }
    } catch (error) {
      console.error('Error submitting service:', error)
      message.error(
        editingService
          ? 'Không thể cập nhật dịch vụ. Vui lòng thử lại sau.'
          : 'Không thể thêm dịch vụ mới. Vui lòng thử lại sau.'
      )
      return // Don't close modal if error
    }

    setIsModalVisible(false)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`api/services/${id}`)

      // Update local state after successful API call
      setServices(services.filter((service) => service.id !== id))
      message.success('Xoá dịch vụ thành công')
    } catch (error) {
      console.error('Error deleting service:', error)
      message.error('Không thể xóa dịch vụ. Vui lòng thử lại sau.')
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const toggleServiceStatus = async (id) => {
    try {
      const service = services.find((s) => s.id === id)
      if (!service) return

      const newStatus = service.status === 'active' ? 'inactive' : 'active'

      // API doesn't have a dedicated status field, so we're updating the whole service
      const requestData = {
        id: service.id,
        serviceName: service.name,
        description: service.description,
        price: service.price,
        category: service.category,
        imageUrl: service.imageUrl
      }

      await api.put(`api/services/${id}`, requestData)

      // Update local state
      setServices(
        services.map((s) =>
          s.id === id
            ? {
                ...s,
                status: newStatus
              }
            : s
        )
      )

      message.success('Cập nhật trạng thái dịch vụ thành công')
    } catch (error) {
      console.error('Error toggling service status:', error)
      message.error('Không thể cập nhật trạng thái dịch vụ. Vui lòng thử lại sau.')
    }
  }

  const filteredServices = services.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase())
  )

  // Categories for filtering and form selection
  const categories = Array.from(new Set(services.map((s) => s.category)))

  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,
      render: (category) => <Tag color='blue'>{category}</Tag>
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} phút`,
      sorter: (a, b) => a.duration - b.duration
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Đã tạm dừng', value: 'inactive' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={() => toggleServiceStatus(record.id)}
          checkedChildren='Hoạt động'
          unCheckedChildren='Tạm dừng'
        />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button type='primary' size='small' icon={<Edit size={14} />} onClick={() => showModal(record)}>
            Chi tiết
          </Button>
          <Button danger size='small' icon={<Trash2 size={14} />} onClick={() => handleDelete(record.id)}>
            Xoá
          </Button>
        </Space>
      )
    }
  ]

  // Removed unused normFile function

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <Title level={4}>Quản lý Dịch vụ</Title>
        <Space>
          <SearchInput
            placeholder='Tìm kiếm dịch vụ...'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} />}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button type='primary' icon={<PlusSquare size={16} />} onClick={() => showModal()}>
            Thêm dịch vụ
          </Button>
        </Space>
      </div>

      {/* Service Statistics */}
      <Row gutter={16} className='mb-6'>
        <Col span={6}>
          <Card>
            <Statistic
              title='Tổng số dịch vụ'
              value={services.length}
              valueStyle={{ color: '#1677ff' }}
              prefix={<Package size={18} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Đang hoạt động'
              value={services.filter((s) => s.status === 'active').length}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${services.length}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Giá trung bình'
              value={services.reduce((acc, curr) => acc + curr.price, 0) / services.length}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarSign size={18} />}
              suffix='đ'
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title='Danh mục'
              value={new Set(services.map((s) => s.category)).size}
              valueStyle={{ color: '#722ed1' }}
              prefix={<PieChart size={18} />}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredServices}
        rowKey='id'
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dịch vụ`
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div className='p-4'>
              <Paragraph>
                <strong>Mô tả:</strong> {record.description}
              </Paragraph>
              <Paragraph>
                <strong>Chuẩn bị:</strong> {record.preparation}
              </Paragraph>
            </div>
          )
        }}
      />

      <Modal
        title={editingService ? 'Chi tiết dịch vụ' : 'Thêm dịch vụ mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name='name'
                label='Tên dịch vụ'
                rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='enabled' label='Trạng thái' valuePropName='checked'>
                <Switch checkedChildren='Hoạt động' unCheckedChildren='Tạm dừng' />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='category'
                label='Danh mục'
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder='Chọn danh mục' allowClear>
                  {categories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                  <Option value='Danh mục mới'>+ Thêm danh mục mới</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='price' label='Giá (VND)' rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name='description'
            label='Mô tả'
            rules={[{ required: true, message: 'Vui lòng nhập mô tả dịch vụ!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='duration'
                label='Thời gian (phút)'
                rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='imageUrl' label='URL Hình ảnh'>
                <Input placeholder='Nhập đường dẫn hình ảnh' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='preparation' label='Hướng dẫn chuẩn bị'>
            <TextArea rows={3} />
          </Form.Item>

          <div className='flex justify-end mt-4'>
            <Button className='mr-2' onClick={handleCancel}>
              Huỷ
            </Button>
            <Button type='primary' htmlType='submit'>
              {editingService ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Image preview modal removed as we're using direct URL input */}
    </div>
  )
}

export default TestServiceManagement
