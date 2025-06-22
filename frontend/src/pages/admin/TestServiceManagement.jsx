import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Typography,
  Divider,
  Tag
} from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, MedicineBoxOutlined } from '@ant-design/icons'

const { Option } = Select
const { Title, Text } = Typography

const TestServiceManagement = () => {
  const [loading, setLoading] = useState(true)
  const [serviceData, setServiceData] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentService, setCurrentService] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    // NOTE: API call cần thực hiện ở đây
    // Cần gọi API để lấy danh sách dịch vụ xét nghiệm
    // API: GET /api/services

    // Mô phỏng việc gọi API
    const fetchServices = async () => {
      try {
        // Thay thế bằng API call thực tế
        // const response = await axios.get('/api/services');
        // setServiceData(response.data);

        // Dữ liệu mẫu
        setTimeout(() => {
          setServiceData([
            {
              key: '1',
              id: 'XN001',
              name: 'Xét nghiệm máu cơ bản',
              category: 'Xét nghiệm máu',
              price: '350,000 VND',
              duration: '1-2 ngày',
              status: 'Đang hoạt động'
            },
            {
              key: '2',
              id: 'XN002',
              name: 'Siêu âm thai nhi',
              category: 'Siêu âm',
              price: '450,000 VND',
              duration: 'Trong ngày',
              status: 'Đang hoạt động'
            },
            {
              key: '3',
              id: 'XN003',
              name: 'Kiểm tra nội tiết tố nữ',
              category: 'Nội tiết',
              price: '750,000 VND',
              duration: '3-5 ngày',
              status: 'Đang hoạt động'
            },
            {
              key: '4',
              id: 'XN004',
              name: 'Khám sức khỏe phụ nữ mang thai',
              category: 'Thai sản',
              price: '550,000 VND',
              duration: 'Trong ngày',
              status: 'Tạm ngưng'
            }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu dịch vụ xét nghiệm:', error)
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const showModal = (service = null) => {
    setCurrentService(service)
    if (service) {
      form.setFieldsValue(service)
    } else {
      form.resetFields()
    }
    setIsModalVisible(true)
  }

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (currentService) {
          // NOTE: API call cần thực hiện ở đây
          // Cần gọi API để cập nhật thông tin dịch vụ
          // API: PUT /api/services/:id
          // Body: values

          message.success('Cập nhật dịch vụ xét nghiệm thành công!')
        } else {
          // NOTE: API call cần thực hiện ở đây
          // Cần gọi API để tạo dịch vụ mới
          // API: POST /api/services
          // Body: values

          message.success('Thêm dịch vụ xét nghiệm thành công!')
        }

        setIsModalVisible(false)
        form.resetFields()

        // Sau khi thêm/cập nhật, gọi lại API lấy danh sách dịch vụ
      })
      .catch((info) => {
        console.log('Validation Failed:', info)
      })
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  const handleDelete = (serviceId) => {
    Modal.confirm({
      title: 'Bạn có chắc chắn muốn xóa dịch vụ xét nghiệm này?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        // NOTE: API call cần thực hiện ở đây
        // Cần gọi API để xóa dịch vụ
        // API: DELETE /api/services/:id

        message.success('Xóa dịch vụ xét nghiệm thành công!')

        // Sau khi xóa, cập nhật lại danh sách dịch vụ
        setServiceData((prevData) => prevData.filter((service) => service.id !== serviceId))
      }
    })
  }

  const getStatusTag = (status) => {
    if (status === 'Đang hoạt động') {
      return (
        <Tag color='success' className='px-3 py-1 rounded-full'>
          Đang hoạt động
        </Tag>
      )
    } else {
      return (
        <Tag color='error' className='px-3 py-1 rounded-full'>
          Tạm ngưng
        </Tag>
      )
    }
  }

  const columns = [
    {
      title: 'Mã dịch vụ',
      dataIndex: 'id',
      key: 'id',
      width: '10%'
    },
    {
      title: 'Tên dịch vụ xét nghiệm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Loại xét nghiệm',
      dataIndex: 'category',
      key: 'category',
      filters: [
        { text: 'Xét nghiệm máu', value: 'Xét nghiệm máu' },
        { text: 'Siêu âm', value: 'Siêu âm' },
        { text: 'Nội tiết', value: 'Nội tiết' },
        { text: 'Thai sản', value: 'Thai sản' }
      ],
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color='blue' className='px-2 py-1 rounded-full'>
          {category}
        </Tag>
      )
    },
    {
      title: 'Giá dịch vụ',
      dataIndex: 'price',
      key: 'price'
    },
    {
      title: 'Thời gian có kết quả',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đang hoạt động', value: 'Đang hoạt động' },
        { text: 'Tạm ngưng', value: 'Tạm ngưng' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>
          <Button
            type='primary'
            ghost
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            className='border-pink-500 text-pink-500 hover:border-pink-700 hover:text-pink-700'
          />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Spin size='large' tip='Đang tải...' />
      </div>
    )
  }

  return (
    <>
      <div className='mb-6'>
        <Title level={3} className='text-gray-800 mb-1'>
          Quản lý dịch vụ xét nghiệm
        </Title>
        <Text type='secondary'>Quản lý thông tin các dịch vụ xét nghiệm và khám sức khỏe phụ nữ</Text>
        <Divider className='mt-4 mb-6' />
      </div>

      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center'>
          <Input
            placeholder='Tìm kiếm dịch vụ...'
            prefix={<SearchOutlined className='text-gray-400' />}
            className='w-64 mr-4'
          />
          <Select placeholder='Lọc theo loại' style={{ width: 180 }} className='mr-2' allowClear>
            <Option value='Xét nghiệm máu'>Xét nghiệm máu</Option>
            <Option value='Siêu âm'>Siêu âm</Option>
            <Option value='Nội tiết'>Nội tiết</Option>
            <Option value='Thai sản'>Thai sản</Option>
          </Select>
        </div>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className='bg-gradient-to-r from-pink-500 to-pink-600 border-none hover:from-pink-600 hover:to-pink-700 shadow-md'
        >
          Thêm dịch vụ xét nghiệm
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={serviceData}
        rowClassName='hover:bg-pink-50'
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} dịch vụ xét nghiệm`
        }}
        className='rounded-lg overflow-hidden shadow-md'
      />

      <Modal
        title={
          <div className='flex items-center'>
            <MedicineBoxOutlined className='text-pink-500 mr-2 text-xl' />
            <span>{currentService ? 'Sửa thông tin dịch vụ xét nghiệm' : 'Thêm dịch vụ xét nghiệm mới'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          className: 'bg-gradient-to-r from-pink-500 to-pink-600 border-none hover:from-pink-600 hover:to-pink-700'
        }}
        centered
        maskClosable={false}
      >
        <Form form={form} layout='vertical' name='serviceForm' className='pt-4'>
          <Form.Item
            name='name'
            label='Tên dịch vụ xét nghiệm'
            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
          >
            <Input placeholder='Nhập tên dịch vụ xét nghiệm' />
          </Form.Item>
          <Form.Item
            name='category'
            label='Loại xét nghiệm'
            rules={[{ required: true, message: 'Vui lòng chọn loại xét nghiệm!' }]}
          >
            <Select placeholder='Chọn loại xét nghiệm'>
              <Option value='Xét nghiệm máu'>Xét nghiệm máu</Option>
              <Option value='Siêu âm'>Siêu âm</Option>
              <Option value='Nội tiết'>Nội tiết</Option>
              <Option value='Thai sản'>Thai sản</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='price'
            label='Giá dịch vụ'
            rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ!' }]}
          >
            <InputNumber
              placeholder='350000'
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter='VND'
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item
            name='duration'
            label='Thời gian có kết quả'
            rules={[{ required: true, message: 'Vui lòng nhập thời gian có kết quả!' }]}
          >
            <Input placeholder='VD: 1-2 ngày, Trong ngày' />
          </Form.Item>
          <Form.Item
            name='status'
            label='Trạng thái'
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder='Chọn trạng thái'>
              <Option value='Đang hoạt động'>Đang hoạt động</Option>
              <Option value='Tạm ngưng'>Tạm ngưng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default TestServiceManagement
