import React, { useState, useEffect } from 'react'
import { Typography, Table, Card, Button, Tag, Space, Select, message, Modal, Upload, Spin } from 'antd'
import { CheckCircle, UploadCloud, Download, Clock, AlertTriangle, RefreshCw, FileText } from 'lucide-react'
import api from '@/configs/axios'
import { format } from 'date-fns'
import { InboxOutlined } from '@ant-design/icons'
import { Empty } from 'antd'

const { Title, Text } = Typography
const { Option } = Select
const { Dragger } = Upload

const TestResultsByService = () => {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)

  // Fetch all test services
  const fetchServices = async () => {
    setServicesLoading(true)
    try {
      const response = await api.get('/api/services')
      setServices(
        response.data.map((service) => ({
          id: service.serviceId,
          name: service.serviceName
        }))
      )
    } catch (error) {
      console.error('Error fetching test services:', error)
      message.error('Không thể tải danh sách dịch vụ xét nghiệm')
    } finally {
      setServicesLoading(false)
    }
  }

  // Fetch booking details by service
  const fetchBookingDetailsByService = async (serviceId) => {
    if (!serviceId) return

    setLoading(true)
    setTestResults([])

    try {
      const response = await api.get(`/api/booking-details/service/${serviceId}`)

      // Transform the data to match our table format
      const formattedData = response.data.map((item) => ({
        id: item.bookingDetailId,
        bookingId: item.bookingId,
        customerName: `${item.firstName} ${item.lastName}`,
        testDate: item.slotDate,
        testName: item.serviceName,
        status: mapStatusToValue(item.status),
        phone: item.phone,
        resultUrl: item.resultFileUrl || null,
        gender: item.gender ? 'Nam' : 'Nữ',
        dateOfBirth: item.dateOfBirth,
        slotShift: item.slotShift
      }))

      setTestResults(formattedData)
    } catch (error) {
      console.error('Error fetching booking details by service:', error)
      message.error('Không thể tải dữ liệu kết quả xét nghiệm')
    } finally {
      setLoading(false)
    }
  }

  // Map status from API to our internal status values
  const mapStatusToValue = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return 'processing'
      case 'Đã có kết quả':
        return 'completed'
      case 'chưa xét nghiệm':
      case 'Đang chờ':
      default:
        return 'pending'
    }
  }

  // Handle service change
  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId)
    fetchBookingDetailsByService(serviceId)
  }

  // Handle file upload
  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options

    if (!selectedRecord) {
      onError('No record selected')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploadLoading(true)
    try {
      const response = await api.post(`/api/booking-details/${selectedRecord.id}/upload-result`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onSuccess(response, file)
      message.success('Tải lên kết quả xét nghiệm thành công')
      setIsUploadModalOpen(false)

      // Refresh the list
      if (selectedService) {
        fetchBookingDetailsByService(selectedService)
      }
    } catch (error) {
      console.error('Error uploading test result:', error)
      onError(error)
      message.error('Không thể tải lên kết quả xét nghiệm')
    } finally {
      setUploadLoading(false)
    }
  }

  // Show upload modal
  const showUploadModal = (record) => {
    setSelectedRecord(record)
    setIsUploadModalOpen(true)
  }

  // Download test result
  const downloadResult = (record) => {
    if (record.resultUrl) {
      window.open(record.resultUrl, '_blank')
    } else {
      message.warning('Không có kết quả để tải xuống')
    }
  }

  // View test details
  const viewDetails = (record) => {
    Modal.info({
      title: 'Chi tiết xét nghiệm',
      width: 600,
      className: 'custom-modal',
      content: (
        <div className='mt-4 space-y-3'>
          <p>
            <strong>Tên khách hàng:</strong> {record.customerName}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {record.phone}
          </p>
          <p>
            <strong>Giới tính:</strong> {record.gender}
          </p>
          <p>
            <strong>Ngày sinh:</strong> {format(new Date(record.dateOfBirth), 'dd/MM/yyyy')}
          </p>
          <p>
            <strong>Ngày xét nghiệm:</strong> {format(new Date(record.testDate), 'dd/MM/yyyy')}
          </p>
          <p>
            <strong>Ca xét nghiệm:</strong> {record.slotShift === 'AM' ? 'Sáng' : 'Chiều'}
          </p>
          <p>
            <strong>Loại xét nghiệm:</strong> {record.testName}
          </p>
          <p>
            <strong>Trạng thái:</strong>{' '}
            {record.status === 'completed'
              ? 'Đã có kết quả'
              : record.status === 'processing'
                ? 'Đang xử lý'
                : 'Đang chờ'}
          </p>
          {record.resultUrl && (
            <div className='mt-6 text-center'>
              <Button type='primary' icon={<Download size={14} />} onClick={() => downloadResult(record)} size='large'>
                Xem kết quả
              </Button>
            </div>
          )}
        </div>
      )
    })
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      render: (id) => id.substring(0, 8) + '...'
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: '22%',
      render: (text, record) => (
        <div>
          <div className='font-medium'>{text}</div>
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Ngày xét nghiệm',
      dataIndex: 'testDate',
      key: 'testDate',
      width: '15%',
      render: (date) => format(new Date(date), 'dd/MM/yyyy'),
      sorter: (a, b) => new Date(a.testDate) - new Date(b.testDate)
    },
    {
      title: 'Ca',
      dataIndex: 'slotShift',
      key: 'slotShift',
      width: '8%',
      render: (shift) => (shift === 'AM' ? 'Sáng' : 'Chiều')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status) => {
        let color = 'default'
        let icon = <Clock size={14} />
        let text = 'Đang chờ'

        if (status === 'processing') {
          color = 'processing'
          icon = <AlertTriangle size={14} />
          text = 'Đang xử lý'
        } else if (status === 'completed') {
          color = 'success'
          icon = <CheckCircle size={14} />
          text = 'Hoàn thành'
        }

        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        )
      },
      filters: [
        { text: 'Đang chờ', value: 'pending' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Hoàn thành', value: 'completed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '30%',
      render: (_, record) => (
        <Space size='small'>
          {record.resultUrl ? (
            <Button
              type='default'
              icon={<Download size={14} />}
              onClick={() => downloadResult(record)}
              className='hover:shadow-sm'
            >
              Xem kết quả
            </Button>
          ) : (
            <Button type='primary' icon={<UploadCloud size={14} />} onClick={() => showUploadModal(record)}>
              Tải lên kết quả
            </Button>
          )}
        </Space>
      )
    }
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <div className='bg-white p-6 rounded-lg'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <Title level={2} className='font-bold m-0'>
            Kết quả xét nghiệm theo dịch vụ
          </Title>
          <Text type='secondary'>Quản lý kết quả xét nghiệm phân loại theo từng dịch vụ</Text>
        </div>
        <Button
          type='primary'
          icon={<RefreshCw size={16} />}
          onClick={() => {
            fetchServices()
            if (selectedService) {
              fetchBookingDetailsByService(selectedService)
            }
          }}
        >
          Làm mới dữ liệu
        </Button>
      </div>

      <Card className='shadow-sm mb-6 border-gray-100'>
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>Chọn dịch vụ xét nghiệm:</label>
          <div className='flex gap-4'>
            <Select
              placeholder='Chọn dịch vụ xét nghiệm'
              style={{ width: '100%', maxWidth: '400px' }}
              loading={servicesLoading}
              onChange={handleServiceChange}
              className='flex-1'
              size='large'
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card className='shadow-sm border-gray-100'>
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : selectedService ? (
          testResults.length > 0 ? (
            <>
              <div className='flex justify-between mb-4 items-center'>
                <Text className='text-base'>
                  Tổng số: <strong>{testResults.length}</strong> kết quả
                </Text>
                <div className='flex flex-wrap gap-2'>
                  <Text strong className='mr-1'>
                    Trạng thái:
                  </Text>
                  <Tag color='default'>Đang chờ: {testResults.filter((item) => item.status === 'pending').length}</Tag>
                  <Tag color='processing'>
                    Đang xử lý: {testResults.filter((item) => item.status === 'processing').length}
                  </Tag>
                  <Tag color='success'>
                    Hoàn thành: {testResults.filter((item) => item.status === 'completed').length}
                  </Tag>
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={testResults}
                rowKey='id'
                pagination={{ pageSize: 10 }}
                size='middle'
                className='border border-gray-100 rounded-md'
              />
            </>
          ) : (
            <Empty
              description='Không có dữ liệu kết quả xét nghiệm cho dịch vụ này'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        ) : (
          <div className='text-center py-12'>
            <FileText size={64} className='mx-auto text-gray-300 mb-4' />
            <Text type='secondary' className='text-lg'>
              Vui lòng chọn một dịch vụ xét nghiệm
            </Text>
          </div>
        )}
      </Card>

      {/* Upload Result Modal */}
      <Modal
        title={<span className='font-bold'>Tải lên kết quả xét nghiệm</span>}
        open={isUploadModalOpen}
        footer={null}
        onCancel={() => setIsUploadModalOpen(false)}
        maskClosable={false}
        width={600}
      >
        <div className='py-4'>
          {selectedRecord && (
            <div className='mb-6 p-5 bg-gray-50 rounded-lg border border-gray-100'>
              <p className='mb-2'>
                <strong>Tên khách hàng:</strong> {selectedRecord.customerName}
              </p>
              <p className='mb-2'>
                <strong>Loại xét nghiệm:</strong> {selectedRecord.testName}
              </p>
              <p className='mb-0'>
                <strong>Ngày xét nghiệm:</strong> {format(new Date(selectedRecord.testDate), 'dd/MM/yyyy')}
              </p>
            </div>
          )}

          <Dragger
            name='file'
            customRequest={handleUpload}
            accept='.pdf'
            showUploadList={true}
            maxCount={1}
            disabled={uploadLoading}
            className='p-8 border border-dashed border-gray-300 bg-gray-50 rounded-lg'
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined style={{ fontSize: '48px' }} />
            </p>
            <p className='ant-upload-text font-medium'>Nhấp hoặc kéo file vào khu vực này để tải lên</p>
            <p className='ant-upload-hint text-gray-500'>Chỉ hỗ trợ tải lên file PDF duy nhất</p>
          </Dragger>

          <div className='mt-6 text-center'>
            <Button loading={uploadLoading} type='primary' size='large' icon={<UploadCloud size={16} />}>
              Tải lên kết quả xét nghiệm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TestResultsByService
