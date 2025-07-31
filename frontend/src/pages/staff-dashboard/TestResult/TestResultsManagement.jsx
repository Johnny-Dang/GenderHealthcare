import React, { useState, useEffect } from 'react'
import { Typography, Table, Card, Button, Tag, Space, Select, message, Modal, Upload, Spin, Empty } from 'antd'
import { CheckCircle, UploadCloud, Download, AlertTriangle, RefreshCw, FileText } from 'lucide-react'
import api from '@/configs/axios'
import { format } from 'date-fns'

const { Title, Text } = Typography
const { Option } = Select
const { Dragger } = Upload

const TestResultsByService = () => {
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [uploadStates, setUploadStates] = useState({})

  // ✅ Chỉ 2 status, bỏ "Chưa xét nghiệm"
  const statusOptions = [
    { value: 'Đã xét nghiệm', label: 'Đã xét nghiệm' },
    { value: 'Đã có kết quả', label: 'Đã có kết quả' }
  ]

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
      message.error('Không thể tải danh sách dịch vụ')
    } finally {
      setServicesLoading(false)
    }
  }

  const fetchTestResults = async (serviceId = null, status = null) => {
    setLoading(true)
    try {
      let endpoint = '/api/booking-details'
      const params = new URLSearchParams()

      // ✅ Truyền đúng status từ backend (chỉ 2 status)
      if (status) {
        params.append('status', status)
      }

      if (serviceId) {
        endpoint = `/api/booking-details/service/${serviceId}`
      }

      const response = await api.get(`${endpoint}?${params.toString()}`)

      // ✅ Filter để chỉ hiển thị 2 status cần thiết
      const filteredData = response.data.filter(
        (item) => item.status === 'Đã xét nghiệm' || item.status === 'Đã có kết quả'
      )

      // ✅ Sắp xếp: "Đã xét nghiệm" LÊN TRƯỚC, "Đã có kết quả" xuống dưới
      const sortedData = filteredData.sort((a, b) => {
        if (a.status === 'Đã xét nghiệm' && b.status === 'Đã có kết quả') return -1
        if (a.status === 'Đã có kết quả' && b.status === 'Đã xét nghiệm') return 1

        // Nếu cùng status, sort theo ngày (mới nhất lên trước)
        return new Date(b.slotDate) - new Date(a.slotDate)
      })

      const formattedData = sortedData.map((item) => ({
        id: item.bookingDetailId,
        customerName: `${item.firstName} ${item.lastName}`,
        testDate: item.slotDate,
        testName: item.serviceName,
        status: item.status,
        phone: item.phone,
        resultUrl: item.resultFileUrl || null,
        slotShift: item.slotShift
      }))

      setTestResults(formattedData)
    } catch (error) {
      message.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    fetchTestResults()
  }, [])

  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId)
    fetchTestResults(serviceId, selectedStatus)
  }

  const handleStatusChange = (status) => {
    setSelectedStatus(status)
    fetchTestResults(selectedService, status)
  }

  const handleUpload = async ({ file, onSuccess, onError }) => {
    const bookingDetailId = selectedRecord?.id

    if (!bookingDetailId) {
      onError('Không tìm thấy thông tin booking')
      return
    }

    setUploadStates((prev) => ({
      ...prev,
      [bookingDetailId]: { loading: true, progress: 0 }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      await api.post(`/api/booking-details/${bookingDetailId}/upload-result`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadStates((prev) => ({
            ...prev,
            [bookingDetailId]: { ...prev[bookingDetailId], progress }
          }))
        }
      })

      setUploadStates((prev) => ({
        ...prev,
        [bookingDetailId]: { loading: false, success: true, progress: 100 }
      }))

      message.success('Upload thành công!')
      onSuccess()
      setIsUploadModalOpen(false)

      setTimeout(() => {
        fetchTestResults(selectedService, selectedStatus)
      }, 1000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Upload thất bại'

      setUploadStates((prev) => ({
        ...prev,
        [bookingDetailId]: { loading: false, error: errorMessage }
      }))

      message.error(errorMessage)
      onError(errorMessage)
    }
  }

  const showUploadModal = (record) => {
    setSelectedRecord(record)
    setIsUploadModalOpen(true)
  }

  const downloadResult = (record) => {
    if (record.resultUrl) {
      window.open(record.resultUrl, '_blank')
    } else {
      message.error('Không tìm thấy file kết quả')
    }
  }

  const clearAllFilters = () => {
    setSelectedService(null)
    setSelectedStatus(null)
    fetchTestResults(null, null)
  }

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div className='font-medium'>{text}</div>
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'testName',
      key: 'testName'
    },
    {
      title: 'Ngày xét nghiệm',
      dataIndex: 'testDate',
      key: 'testDate',
      render: (date) => format(new Date(date), 'dd/MM/yyyy')
    },
    {
      title: 'Ca',
      dataIndex: 'slotShift',
      key: 'slotShift',
      render: (shift) => (shift === 'AM' ? 'Sáng' : 'Chiều')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'Đã xét nghiệm') {
          return (
            <Tag icon={<AlertTriangle size={14} />} color='warning'>
              Đã xét nghiệm
            </Tag>
          )
        }
        if (status === 'Đã có kết quả') {
          return (
            <Tag icon={<CheckCircle size={14} />} color='success'>
              Đã có kết quả
            </Tag>
          )
        }
        return null
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.resultUrl ? (
            <Button type='default' icon={<Download size={16} />} onClick={() => downloadResult(record)}>
              Xem kết quả
            </Button>
          ) : record.status === 'Đã xét nghiệm' ? (
            <Button type='primary' icon={<UploadCloud size={16} />} onClick={() => showUploadModal(record)}>
              Tải lên kết quả
            </Button>
          ) : (
            <Button disabled>Chưa thể tải kết quả</Button>
          )}
        </Space>
      )
    }
  ]

  const UploadStatusIndicator = ({ bookingDetailId }) => {
    const status = uploadStates[bookingDetailId]
    if (!status) return null

    if (status.loading) {
      return (
        <div className='flex items-center gap-2 text-blue-600 mt-2'>
          <Spin size='small' />
          <span>Đang upload... {status.progress}%</span>
        </div>
      )
    }

    if (status.success) {
      return (
        <div className='flex items-center gap-2 text-green-600 mt-2'>
          <CheckCircle size={16} />
          <span>Upload thành công!</span>
        </div>
      )
    }

    if (status.error) {
      return (
        <div className='flex items-center gap-2 text-red-600 mt-2'>
          <AlertTriangle size={16} />
          <span className='text-sm'>{status.error}</span>
        </div>
      )
    }

    return null
  }

  return (
    <div className='p-6'>
      <Card className='mb-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <Title level={3} className='mb-1 flex items-center gap-2'>
              <FileText size={24} />
              Quản lý kết quả xét nghiệm
            </Title>
            <Text type='secondary'>Quản lý kết quả xét nghiệm theo dịch vụ</Text>
          </div>
          <Space>
            <Button onClick={clearAllFilters} icon={<RefreshCw size={16} />}>
              Xóa bộ lọc
            </Button>
            <Button
              type='primary'
              onClick={() => fetchTestResults(selectedService, selectedStatus)}
              icon={<RefreshCw size={16} />}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Dịch vụ:</label>
            <Select
              placeholder='Tất cả dịch vụ'
              style={{ width: '100%' }}
              loading={servicesLoading}
              onChange={handleServiceChange}
              allowClear
              value={selectedService}
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Trạng thái:</label>
            <Select
              placeholder='Tất cả trạng thái'
              style={{ width: '100%' }}
              onChange={handleStatusChange}
              allowClear
              value={selectedStatus}
            >
              {statusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className='text-center py-12'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : testResults.length > 0 ? (
          <>
            <div className='mb-4 flex justify-between items-center'>
              <Text>
                Tổng số: <strong>{testResults.length}</strong> kết quả
              </Text>
              <Space>
                <Tag color='warning'>
                  Đã xét nghiệm: {testResults.filter((item) => item.status === 'Đã xét nghiệm').length}
                </Tag>
                <Tag color='success'>
                  Đã có kết quả: {testResults.filter((item) => item.status === 'Đã có kết quả').length}
                </Tag>
              </Space>
            </div>
            <Table columns={columns} dataSource={testResults} rowKey='id' pagination={{ pageSize: 10 }} />
          </>
        ) : (
          <Empty description='Không có dữ liệu' />
        )}
      </Card>

      <Modal
        title='Tải lên kết quả xét nghiệm'
        open={isUploadModalOpen}
        footer={null}
        onCancel={() => setIsUploadModalOpen(false)}
        width={500}
      >
        {selectedRecord && (
          <div className='mb-4 p-4 bg-gray-50 rounded'>
            <p>
              <strong>Khách hàng:</strong> {selectedRecord.customerName}
            </p>
            <p>
              <strong>Dịch vụ:</strong> {selectedRecord.testName}
            </p>
            <p>
              <strong>Ngày:</strong> {format(new Date(selectedRecord.testDate), 'dd/MM/yyyy')}
            </p>
          </div>
        )}

        <Dragger customRequest={handleUpload} accept='.pdf' maxCount={1} showUploadList={false}>
          <p className='ant-upload-text'>Nhấp hoặc kéo file PDF vào đây</p>
        </Dragger>

        <UploadStatusIndicator bookingDetailId={selectedRecord?.id} />
      </Modal>
    </div>
  )
}

export default TestResultsByService
