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
  Stethoscope,
  RefreshCw
} from 'lucide-react'
// Removed unused UploadOutlined import
import api from '../../../configs/axios'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import ImageModal from '@/components/ImageModal'

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
  const [imageUrl, setImageUrl] = useState('')
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState('')
  const [switchEnabled, setSwitchEnabled] = useState(true)

  // Fetch data from API
  const fetchServices = async () => {
    setLoading(true)
    try {
      console.log('Fetching services from API...')

      // Using configured api client from configs/axios.js
      const response = await api.get('/api/services/admin')
      console.log('API Response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        console.log('Retrieved services:', response.data.length)

        // Transform the API response to match our component's data structure
        const transformedServices = response.data.map((service) => ({
          id: service.serviceId,
          name: service.serviceName,
          title: service.title || service.serviceName, // Use title if available, fallback to serviceName
          description: service.description,
          price: service.price,
          category: service.category,
          imageUrl: service.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image',
          status: service.isDeleted ? 'inactive' : 'active', // Map isDeleted to status
          isDeleted: Boolean(service.isDeleted), // Ensure isDeleted is a boolean
          duration: 30, // Default duration since API doesn't provide this
          preparation: 'Liên hệ nhân viên để biết thêm chi tiết', // Default preparation
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }))

        setServices(transformedServices)

        if (transformedServices.length > 0) {
          message.success(`Đã tải ${transformedServices.length} dịch vụ từ hệ thống`)
        } else {
          message.info('Hiện tại không có dịch vụ nào trong hệ thống')
        }
      } else {
        console.error('Unexpected API response format or empty data:', response.data)
        setServices([])
        message.error('Dữ liệu API không đúng định dạng hoặc không có dịch vụ nào')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      console.error('Error details:', error.response?.data)
      setServices([])
      message.error('Không thể kết nối tới API. Vui lòng kiểm tra kết nối hoặc thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const showModal = (service = null) => {
    setEditingService(service)
    if (service) {
      const isEnabled = !service.isDeleted
      form.setFieldsValue({
        name: service.name,
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category,
        enabled: isEnabled,
        duration: service.duration,
        preparation: service.preparation,
        imageUrl: service.imageUrl
      })
      setImageUrl(service.imageUrl || '')
      setSwitchEnabled(isEnabled)
    } else {
      form.resetFields()
      form.setFieldsValue({
        status: 'active',
        enabled: true
      })
      setImageUrl('')
      setSwitchEnabled(true)
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleSubmit = async (values) => {
    const isDeleted = !values.enabled
    delete values.enabled

    try {
      if (editingService) {
        // Update existing service - use only one API call with the admin endpoint
        const requestData = {
          Id: editingService.id, // Add Id field to match backend validator requirements
          serviceName: values.name,
          title: values.title,
          description: values.description,
          price: values.price,
          category: values.category,
          imageUrl: values.imageUrl || editingService.imageUrl,
          isDeleted: isDeleted
        }

        console.log('Updating service with data:', requestData)
        console.log('Service ID:', editingService.id)

        // Single API call to update all properties including isDeleted
        try {
          const updateResponse = await api.put(`/api/services/${editingService.id}`, requestData)
          console.log('Update response:', updateResponse.data)
        } catch (err) {
          console.error('Detailed update error:', err.response?.data)
          console.error('Request that caused error:', requestData)
          throw err // Re-throw to be caught by outer catch block
        }

        // Refresh data from server instead of updating local state
        await fetchServices()
        message.success('Cập nhật dịch vụ thành công')
      } else {
        // Add new service
        const requestData = {
          serviceName: values.name,
          title: values.title,
          description: values.description,
          price: values.price,
          category: values.category,
          imageUrl: values.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image',
          isDeleted: isDeleted // Include isDeleted in initial creation
        }

        console.log('Creating new service:', requestData)
        const response = await api.post('/api/services', requestData)
        console.log('Create response:', response.data)

        // Refresh data from server
        await fetchServices()
        message.success('Thêm dịch vụ thành công')
      }
    } catch (error) {
      console.error('Error submitting service:', error)
      console.error('Error response status:', error.response?.status)
      console.error('Error response data:', error.response?.data)

      // More detailed error message
      if (error.response?.status === 400) {
        message.error(`Lỗi dữ liệu: ${error.response.data?.message || 'Dữ liệu không hợp lệ'}`)
      } else if (error.response?.status === 401) {
        message.error('Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.')
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền thực hiện thao tác này.')
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy dịch vụ này trên hệ thống.')
      } else {
        message.error(
          editingService
            ? 'Không thể cập nhật dịch vụ. Vui lòng thử lại sau.'
            : 'Không thể thêm dịch vụ mới. Vui lòng thử lại sau.'
        )
      }
      return // Don't close modal if error
    }

    setIsModalVisible(false)
  }

  const handleDelete = async (id) => {
    // Find the service to show its name in the confirmation dialog
    const serviceToDelete = services.find((s) => s.id === id)
    if (!serviceToDelete) {
      message.error('Không tìm thấy dịch vụ này')
      return
    }

    Modal.confirm({
      title: 'Xác nhận tạm ngừng dịch vụ',
      content: `Bạn có chắc chắn muốn tạm ngừng dịch vụ "${serviceToDelete.name}" không?`,
      okText: 'Tạm ngừng',
      okType: 'danger',
      cancelText: 'Huỷ',
      async onOk() {
        try {
          console.log(`Setting isDeleted=true for service with ID: ${id}`)

          // Make the API call to update isDeleted status instead of deleting
          const requestData = {
            Id: id, // Add Id field to match backend validator requirements
            serviceName: serviceToDelete.name,
            description: serviceToDelete.description,
            price: serviceToDelete.price,
            category: serviceToDelete.category,
            imageUrl: serviceToDelete.imageUrl,
            isDeleted: true
          }

          const updateResponse = await api.put(`/api/services/${id}`, requestData)
          console.log('Update API response:', updateResponse)

          // Refresh data from server
          await fetchServices()
          message.success(`Đã tạm ngừng dịch vụ "${serviceToDelete.name}" thành công`)
        } catch (error) {
          console.error('Error updating service status:', error)
          console.error('Error details:', {
            response: error.response?.data,
            status: error.response?.status,
            message: error.message
          })

          // Show more specific error message
          if (error.response?.status === 404) {
            message.error('Không tìm thấy dịch vụ này trên hệ thống')
          } else if (error.response?.status === 403) {
            message.error('Bạn không có quyền tạm ngừng dịch vụ này')
          } else if (error.message.includes('Network Error')) {
            message.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại')
          } else {
            message.error('Không thể tạm ngừng dịch vụ. Vui lòng thử lại sau.')
          }
        }
      }
    })
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const toggleServiceStatus = async (id) => {
    try {
      const service = services.find((s) => s.id === id)
      if (!service) return

      // Toggle isDeleted value
      const newIsDeleted = !service.isDeleted

      console.log(`Toggling service ${id} status to isDeleted: ${newIsDeleted}`)

      // Using admin API endpoint to toggle isDeleted status
      const requestData = {
        Id: id, // Add Id field to match backend validator requirements
        serviceName: service.name,
        description: service.description,
        price: service.price,
        category: service.category,
        imageUrl: service.imageUrl,
        isDeleted: newIsDeleted
      }

      const statusResponse = await api.put(`/api/services/${id}`, requestData)
      console.log('Status update response:', statusResponse.data)

      // Refresh data from server
      await fetchServices()
      message.success(`Dịch vụ đã được ${newIsDeleted ? 'tạm dừng' : 'kích hoạt'} thành công`)
    } catch (error) {
      console.error('Error toggling service status:', error)
      console.error('Error details:', error.response?.data)
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
      render: (text) => <a className='transition-all duration-300 hover:text-purple-600 hover:font-medium'>{text}</a>
    },
    {
      title: 'Tiêu đề chi tiết',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className='text-gray-600 text-sm'>{text}</span>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map((c) => ({ text: c, value: c })),
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color='purple' className='transition-all duration-300 hover:scale-110'>
          {category}
        </Tag>
      )
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span className='transition-all duration-300 hover:text-red-500 hover:font-bold'>{`${price.toLocaleString('vi-VN')}đ`}</span>
      ),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url) => (
        <img
          src={url}
          alt='Ảnh dịch vụ'
          style={{
            width: 60,
            height: 60,
            objectFit: 'cover',
            borderRadius: 6,
            cursor: 'pointer',
            border: '1px solid #eee'
          }}
          onClick={() => {
            setSelectedImageUrl(url)
            setImageModalVisible(true)
          }}
        />
      ),
      width: 80
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isDeleted',
      key: 'status',
      filters: [
        { text: 'Đang hoạt động', value: false },
        { text: 'Đã tạm dừng', value: true }
      ],
      onFilter: (value, record) => record.isDeleted === value,
      render: (isDeleted, record) => (
        <Switch
          checked={!isDeleted}
          onChange={() => toggleServiceStatus(record.id)}
          checkedChildren='Hoạt động'
          unCheckedChildren='Tạm dừng'
          className='transition-all duration-300 hover:scale-110 hover:shadow-md'
          style={{
            backgroundColor: !isDeleted ? '#7c3aed' /* purple-600 */ : '#e5e7eb' /* gray-200 */,
            borderColor: !isDeleted ? '#7c3aed' : '#d1d5db'
          }}
        />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='primary'
            size='small'
            icon={<Edit size={14} />}
            onClick={() => showModal(record)}
            className='bg-purple-500 hover:bg-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-md'
          >
            Cập nhật
          </Button>
        </Space>
      )
    }
  ]

  // Removed unused normFile function

  return (
    <div className='bg-gradient-to-br from-purple-50 via-white to-purple-50 p-6 rounded-lg shadow-sm min-h-screen'>
      <div className='flex justify-between items-center mb-6 bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-lg shadow-sm'>
        <Title level={4} className='transition-all duration-300 hover:text-purple-600 hover:translate-x-1 mb-0'>
          Quản lý Dịch vụ
        </Title>
        <Space>
          <Button
            icon={<RefreshCw size={16} className='group-hover:rotate-180 transition-transform duration-500' />}
            onClick={fetchServices}
            className='transition-all duration-300 hover:shadow-md hover:text-purple-600 hover:border-purple-400 group bg-white'
          >
            Làm mới
          </Button>
          <SearchInput
            placeholder='Tìm kiếm dịch vụ...'
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<Search size={16} className='text-purple-400' />}
            onChange={(e) => setSearchText(e.target.value)}
            className='transition-all duration-300 hover:shadow-md focus:border-purple-400'
          />
          <Button
            type='primary'
            icon={<PlusSquare size={16} />}
            onClick={() => showModal()}
            className='bg-purple-500 hover:bg-purple-600 transition-all duration-300 hover:shadow-lg hover:scale-105'
          >
            Thêm dịch vụ
          </Button>
        </Space>
      </div>

      {/* Service Statistics */}
      <Row gutter={16} className='mb-6 p-2 bg-purple-50/30 rounded-lg'>
        <Col span={6}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-purple-400 bg-white'>
            <Statistic
              title='Tổng số dịch vụ'
              value={services.length}
              valueStyle={{ color: '#1677ff' }}
              prefix={<Package size={18} className='text-purple-500 animate-pulse' />}
              className='transition-all duration-300 hover:scale-105'
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-green-400 bg-white'>
            <Statistic
              title='Đang hoạt động'
              value={services.filter((s) => !s.isDeleted).length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<Stethoscope size={18} className='text-green-500 animate-pulse' />}
              suffix={`/ ${services.length}`}
              className='transition-all duration-300 hover:scale-105'
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-red-400 bg-white'>
            <Statistic
              title='Giá trung bình'
              value={services.reduce((acc, curr) => acc + curr.price, 0) / services.length}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarSign size={18} className='text-red-500 animate-pulse' />}
              suffix='đ'
              className='transition-all duration-300 hover:scale-105'
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className='transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-indigo-400 bg-white'>
            <Statistic
              title='Danh mục'
              value={new Set(services.map((s) => s.category)).size}
              valueStyle={{ color: '#722ed1' }}
              prefix={<PieChart size={18} className='text-indigo-500 animate-pulse' />}
              className='transition-all duration-300 hover:scale-105'
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
        className='bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md border border-purple-200'
        rowClassName={() => 'transition-all duration-300 hover:bg-purple-50'}
        expandable={{
          expandedRowRender: (record) => (
            <div className='p-4 bg-purple-50/40 rounded-md transition-all duration-300 hover:bg-purple-100 border border-purple-200'>
              <Paragraph className='transition-all duration-300 hover:text-purple-700'>
                <strong>Tiêu đề chi tiết:</strong> {record.title}
              </Paragraph>
              <Paragraph className='transition-all duration-300 hover:text-purple-700'>
                <strong>Mô tả:</strong> {record.description}
              </Paragraph>
              <Paragraph className='transition-all duration-300 hover:text-purple-700'>
                <strong>Chuẩn bị:</strong> {record.preparation}
              </Paragraph>
            </div>
          )
        }}
      />

      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        className='service-modal-modern'
        bodyStyle={{
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div className='flex h-[80vh]'>
          {/* Sidebar */}
          <div className='w-80 bg-gradient-to-b from-purple-600 to-indigo-700 text-white p-6 flex flex-col'>
            <div className='flex items-center gap-3 mb-8'>
              <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
                <Package size={20} className='text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold'>{editingService ? 'Chỉnh sửa' : 'Thêm mới'}</h2>
                <p className='text-purple-100 text-sm'>Dịch vụ y tế</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className='flex-1'>
              <div className='space-y-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-medium'>
                    1
                  </div>
                  <div>
                    <p className='font-medium'>Thông tin cơ bản</p>
                    <p className='text-purple-200 text-xs'>Tên, danh mục, giá</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 opacity-60'>
                  <div className='w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium'>
                    2
                  </div>
                  <div>
                    <p className='font-medium'>Mô tả chi tiết</p>
                    <p className='text-purple-200 text-xs'>Thông tin dịch vụ</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 opacity-60'>
                  <div className='w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium'>
                    3
                  </div>
                  <div>
                    <p className='font-medium'>Cài đặt & Ảnh</p>
                    <p className='text-purple-200 text-xs'>Trạng thái, hình ảnh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              <Button
                type='primary'
                size='large'
                onClick={() => form.submit()}
                className='w-full bg-white text-purple-600 hover:bg-purple-50 border-0 font-semibold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'
              >
                {editingService ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ mới'}
              </Button>
              <Button
                size='large'
                onClick={handleCancel}
                className='w-full bg-white/10 text-white hover:bg-white/20 border-white/20 font-medium h-10 rounded-xl transition-all duration-300'
              >
                Hủy bỏ
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 bg-gray-50 overflow-y-auto'>
            <Form form={form} layout='vertical' onFinish={handleSubmit} className='p-8 space-y-8'>
              {/* Step 1: Basic Information */}
              <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>1</span>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-gray-800'>Thông tin cơ bản</h3>
                    <p className='text-gray-500 text-sm'>Nhập thông tin cơ bản của dịch vụ</p>
                  </div>
                </div>

                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <Form.Item
                      name='name'
                      label={
                        <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide'>
                          Tên dịch vụ <span className='text-red-500'>*</span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
                    >
                      <Input
                        placeholder='Ví dụ: Xét nghiệm máu tổng quát'
                        className='h-12 rounded-xl border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300 text-base'
                        size='large'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='title'
                      label={
                        <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide'>
                          Tiêu đề chi tiết <span className='text-red-500'>*</span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng nhập tiêu đề chi tiết!' }]}
                    >
                      <Input
                        placeholder='Ví dụ: Xét nghiệm máu tổng quát CBC'
                        className='h-12 rounded-xl border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300 text-base'
                        size='large'
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <Form.Item
                      name='category'
                      label={
                        <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide'>
                          Danh mục <span className='text-red-500'>*</span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                    >
                      <Select
                        placeholder='Chọn danh mục dịch vụ'
                        allowClear
                        className='h-12 rounded-xl'
                        size='large'
                        dropdownClassName='rounded-xl'
                      >
                        {Array.from(
                          new Set([...categories, 'Xét nghiệm', 'Khám tổng quát', 'Tư vấn', 'Điều trị', 'Chẩn đoán'])
                        ).map((category) => (
                          <Option key={category} value={category}>
                            {category}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name='price'
                      label={
                        <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide'>
                          Giá dịch vụ (VND) <span className='text-red-500'>*</span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                    >
                      <InputNumber
                        style={{ width: '100%', height: '48px' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        min={0}
                        placeholder='Ví dụ: 200,000'
                        className='rounded-xl border-gray-200 hover:border-purple-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-300 text-base'
                        size='large'
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Step 2: Description */}
              <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>2</span>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-gray-800'>Mô tả chi tiết</h3>
                    <p className='text-gray-500 text-sm'>Cung cấp thông tin chi tiết về dịch vụ</p>
                  </div>
                </div>

                <Form.Item
                  name='description'
                  label={
                    <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide'>
                      Mô tả dịch vụ <span className='text-red-500'>*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả dịch vụ!' }]}
                >
                  <TextArea
                    rows={6}
                    placeholder='Mô tả chi tiết về dịch vụ, quy trình thực hiện, thời gian chờ kết quả, và những thông tin cần thiết khác...'
                    className='rounded-xl border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 resize-none text-base'
                  />
                </Form.Item>
              </div>

              {/* Step 3: Settings & Image */}
              <div className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center'>
                    <span className='text-white font-bold text-lg'>3</span>
                  </div>
                  <div>
                    <h3 className='text-xl font-bold text-gray-800'>Cài đặt & Hình ảnh</h3>
                    <p className='text-gray-500 text-sm'>Cấu hình trạng thái và thêm hình ảnh</p>
                  </div>
                </div>

                <Row gutter={[24, 24]}>
                  <Col span={12}>
                    <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200'>
                      <Form.Item
                        name='enabled'
                        label={
                          <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide'>
                            Trạng thái dịch vụ
                          </span>
                        }
                        valuePropName='checked'
                        initialValue={true}
                        className='mb-0'
                      >
                        <Switch
                          checkedChildren='Hoạt động'
                          unCheckedChildren='Tạm dừng'
                          className='transition-all duration-300 hover:scale-110 hover:shadow-md'
                          style={{
                            backgroundColor: switchEnabled ? '#7c3aed' : '#e5e7eb',
                            borderColor: switchEnabled ? '#7c3aed' : '#d1d5db'
                          }}
                          size='default'
                          onChange={(checked) => setSwitchEnabled(checked)}
                        />
                      </Form.Item>
                      <p className='text-gray-500 text-xs mt-2'>
                        Dịch vụ sẽ{' '}
                        {editingService
                          ? editingService.isDeleted
                            ? 'được kích hoạt'
                            : 'bị tạm dừng'
                          : 'được kích hoạt'}{' '}
                        sau khi lưu
                      </p>
                    </div>
                  </Col>
                </Row>

                <div className='mt-6'>
                  <Form.Item
                    label={
                      <span className='text-gray-700 font-semibold text-sm uppercase tracking-wide '>
                        Hình ảnh dịch vụ
                      </span>
                    }
                    name='imageUrl'
                    className='mb-0'
                  >
                    <CloudinaryUpload
                      onUploadSuccess={(url) => {
                        setImageUrl(url)
                        form.setFieldsValue({ imageUrl: url })
                      }}
                      currentImageUrl={imageUrl}
                      folder='testservices'
                      label='Chọn ảnh dịch vụ'
                      size={240}
                      buttonClass='!bg-purple-500 hover:!bg-purple-600'
                    />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

      <ImageModal isOpen={imageModalVisible} imageUrl={selectedImageUrl} onClose={() => setImageModalVisible(false)} />
    </div>
  )
}

export default TestServiceManagement
