import React, { useState, useEffect } from 'react'
import {
  Typography,
  Table,
  Card,
  Button,
  Tag,
  Space,
  Select,
  message,
  Modal,
  Upload,
  Spin,
  Empty,
  DatePicker
} from 'antd'
import {
  CheckCircle,
  UploadCloud,
  Download,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Inbox,
  Calendar,
  FileText
} from 'lucide-react'
import api from '@/configs/axios'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

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
  const [uploadLoading, setUploadLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDateRange, setSelectedDateRange] = useState(null)
  const [uploadStates, setUploadStates] = useState({}) // Track upload state

  const statusOptions = [
    { value: 'Đã xét nghiệm', label: 'Đã xét nghiệm' },
    { value: 'Đã có kết quả', label: 'Đã có kết quả' }
  ]

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
      message.error('Không thể tải danh sách dịch vụ xét nghiệm')
    } finally {
      setServicesLoading(false)
    }
  }

  // Fetch booking details by service (remove date filtering from API)
  const fetchTestResults = async (serviceId = null, status = null) => {
    setLoading(true)
    try {
      let endpoint = '/api/booking-details'
      const params = new URLSearchParams()

      if (status) {
        params.append('status', status)
      }

      if (serviceId) {
        endpoint = `/api/booking-details/service/${serviceId}`
      }

      const response = await api.get(`${endpoint}?${params.toString()}`)
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
      message.error('Không thể tải dữ liệu kết quả xét nghiệm')
    } finally {
      setLoading(false)
    }
  }

  // Map status from API to our internal status values
  const mapStatusToValue = (status) => {
    switch (status?.toLowerCase()) {
      case 'đã có kết quả':
        return 'completed'
      case 'đã xét nghiệm':
        return 'tested'
      default:
        return 'pending'
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
    const bookingDetailId = selectedRecord?.id // Dùng id thay vì bookingId

    if (!bookingDetailId) {
      onError('Không tìm thấy thông tin booking detail')
      return
    }

    // Set loading state
    setUploadStates((prev) => ({
      ...prev,
      [bookingDetailId]: { loading: true, error: null, success: false, progress: 0 }
    }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      // API endpoint theo đúng spec: /api/booking-details/{id}/upload-result
      const response = await api.post(`/api/booking-details/${bookingDetailId}/upload-result`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 180000, // 3 phút timeout cho upload
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

          // Update progress
          setUploadStates((prev) => ({
            ...prev,
            [bookingDetailId]: { ...prev[bookingDetailId], progress: percentCompleted }
          }))
        }
      })

      // Success
      setUploadStates((prev) => ({
        ...prev,
        [bookingDetailId]: {
          loading: false,
          error: null,
          success: true,
          progress: 100
        }
      }))

      message.success('Upload kết quả thành công!')
      onSuccess(response.data)

      // Close modal và refresh data
      setIsUploadModalOpen(false)
      setTimeout(() => {
        fetchTestResults(selectedService, selectedStatus) // Refresh lại danh sách
      }, 1000)
    } catch (error) {
      console.error('Upload error:', error)

      let errorMessage = 'Upload thất bại'

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload mất quá nhiều thời gian. Vui lòng kiểm tra lại sau vài phút.'
        message.warning(errorMessage)

        // Polling để check status sau khi timeout
        setTimeout(() => {
          checkUploadStatus(bookingDetailId)
        }, 30000) // Check sau 30s
      } else if (error.response?.status === 413) {
        errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      setUploadStates((prev) => ({
        ...prev,
        [bookingDetailId]: {
          loading: false,
          error: errorMessage,
          success: false,
          progress: 0
        }
      }))

      message.error(errorMessage)
      onError(errorMessage)
    }
  }

  // Cập nhật function checkUploadStatus
  const checkUploadStatus = async (bookingDetailId) => {
    try {
      // Fetch lại data để check có result chưa
      const response = await api.get(`/api/booking-details/${bookingDetailId}`)

      if (response.data.resultFileUrl) {
        setUploadStates((prev) => ({
          ...prev,
          [bookingDetailId]: {
            loading: false,
            error: null,
            success: true,
            progress: 100
          }
        }))

        message.success('File đã được upload thành công!')
        fetchTestResults(selectedService, selectedStatus) // Refresh data
      }
    } catch (error) {
      console.error('Error checking upload status:', error)
    }
  }

  // Cập nhật UploadStatusIndicator để dùng bookingDetailId
  const UploadStatusIndicator = ({ bookingDetailId }) => {
    const status = uploadStates[bookingDetailId]

    if (!status) return null

    if (status.loading) {
      return (
        <div className='flex items-center gap-2 text-blue-600 mt-2'>
          <Spin size='small' />
          <span className='text-sm'>Đang upload... {status.progress}%</span>
        </div>
      )
    }

    if (status.success) {
      return (
        <div className='flex items-center gap-2 text-green-600 mt-2'>
          <CheckCircle className='h-4 w-4' />
          <span className='text-sm'>Upload thành công!</span>
        </div>
      )
    }

    if (status.error) {
      return (
        <div className='flex items-center gap-2 text-red-600 mt-2'>
          <AlertTriangle className='h-4 w-4' />
          <span className='text-xs'>{status.error}</span>
        </div>
      )
    }

    return null
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => <span className='font-mono'>{id.substring(0, 8) + '...'}</span>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 160,
      render: (text, record) => (
        <div>
          <span className='font-medium'>{text}</span>
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
    },
    // Thêm cột Dịch vụ xét nghiệm
    {
      title: 'Dịch vụ xét nghiệm',
      dataIndex: 'testName',
      key: 'testName',
      width: 180,
      render: (testName) => <span className='font-medium text-gray-500'>{testName}</span>
    },
    {
      title: 'Ngày xét nghiệm',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
      render: (date) => format(new Date(date), 'dd/MM/yyyy')
    },
    {
      title: 'Ca',
      dataIndex: 'slotShift',
      key: 'slotShift',
      width: 80,
      render: (shift) => (shift === 'AM' ? 'Sáng' : 'Chiều')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: [
        { text: 'Đã xét nghiệm', value: 'tested' },
        { text: 'Đã có kết quả', value: 'completed' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = 'default'
        let icon = <Clock size={16} />
        let text = 'Đang chờ'
        if (status === 'tested') {
          color = 'warning'
          icon = <AlertTriangle size={16} />
          text = 'Đã xét nghiệm'
        } else if (status === 'completed') {
          color = 'success'
          icon = <CheckCircle size={16} />
          text = 'Đã có kết quả'
        }
        return (
          <Tag icon={icon} color={color}>
            {text}
          </Tag>
        )
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size='small'>
          {record.resultUrl ? (
            <Button
              type='default'
              icon={<Download size={18} />}
              onClick={() => downloadResult(record)}
              className='hover:shadow-sm'
            >
              Xem kết quả
            </Button>
          ) : record.status === 'tested' ? (
            <Button
              type='primary'
              icon={<UploadCloud size={18} />}
              onClick={() => showUploadModal(record)}
              className='bg-blue-600 hover:bg-blue-700 text-white'
            >
              Tải lên kết quả
            </Button>
          ) : (
            <Button disabled icon={<UploadCloud size={18} />}>
              Chưa thể tải kết quả
            </Button>
          )}
        </Space>
      )
    }
  ]

  // Thêm các function bị thiếu
  const clearAllFilters = () => {
    setSelectedService(null)
    setSelectedStatus(null)
    setSelectedDateRange(null)
    setSearchTerm('')
    fetchTestResults(null, null)
  }

  const handleDateRangeChange = (dates) => {
    setSelectedDateRange(dates)
    // Có thể thêm logic filter theo date nếu cần
  }

  const getFilteredData = (data) => {
    let filtered = data

    // Filter by search term (name or phone)
    if (searchTerm) {
      filtered = filtered.filter(
        (item) => item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || item.phone.includes(searchTerm)
      )
    }

    // Filter by date range
    if (selectedDateRange && selectedDateRange.length === 2) {
      const [startDate, endDate] = selectedDateRange
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.testDate)
        return itemDate >= startDate && itemDate <= endDate
      })
    }

    return filtered
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

  return (
    <div className='min-h-screen bg-orange-50'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <Card className='shadow-lg border-0 mb-8 hover:shadow-xl transition-all duration-300'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <Title level={2} className='!mb-1 gradient-text text-orange-600 flex items-center gap-2'>
                <FileText size={28} className='text-orange-500 animate-pulse' />
                Kết quả xét nghiệm theo dịch vụ
              </Title>
              <Text type='secondary'>Quản lý kết quả xét nghiệm phân loại theo từng dịch vụ</Text>
            </div>
            <Space>
              <Button
                type='default'
                icon={<RefreshCw size={18} />}
                onClick={clearAllFilters}
                className='hover:shadow-sm hover:text-orange-500 hover:border-orange-500 transition-all duration-300'
              >
                Xóa tất cả bộ lọc
              </Button>
              <Button
                type='primary'
                icon={<RefreshCw size={18} />}
                onClick={() => fetchTestResults(selectedService, selectedStatus)}
                className='bg-orange-600 hover:bg-orange-700 transition-all duration-300 hover:shadow-md hover:scale-105'
              >
                Làm mới dữ liệu
              </Button>
            </Space>
          </div>

          <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            <div className='min-w-[200px]'>
              <label className='block text-sm font-medium mb-2 text-gray-600'>Lọc theo dịch vụ:</label>
              <Select
                placeholder='Tất cả dịch vụ'
                style={{ width: '100%' }}
                loading={servicesLoading}
                onChange={handleServiceChange}
                allowClear
                onClear={() => {
                  setSelectedService(null)
                  fetchTestResults(null, selectedStatus)
                }}
                size='large'
                value={selectedService}
                className='hover:border-orange-400 transition-all duration-300'
              >
                {services.map((service) => (
                  <Option key={service.id} value={service.id}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div className='min-w-[200px]'>
              <label className='block text-sm font-medium mb-2 text-gray-600'>Lọc theo trạng thái:</label>
              <Select
                placeholder='Tất cả trạng thái'
                style={{ width: '100%' }}
                onChange={handleStatusChange}
                allowClear
                onClear={() => {
                  setSelectedStatus(null)
                  fetchTestResults(selectedService, null)
                }}
                size='large'
                value={selectedStatus}
                className='hover:border-orange-400 transition-all duration-300'
              >
                {statusOptions.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div className='min-w-[200px]'>
              <label className='block text-sm font-medium mb-2 text-gray-600'>Lọc theo khoảng ngày:</label>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                size='large'
                placeholder={['Từ ngày', 'Đến ngày']}
                format='DD/MM/YYYY'
                locale={vi}
                value={selectedDateRange}
                onChange={handleDateRangeChange}
                allowClear
                suffixIcon={<Calendar size={16} />}
                className='hover:border-orange-400 transition-all duration-300'
              />
            </div>

            <div className='min-w-[200px]'>
              <label className='block text-sm font-medium mb-2 text-gray-600'>Tìm kiếm:</label>
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Tên hoặc SĐT...'
                  className='w-full p-2 border border-gray-300 rounded text-sm hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-all duration-300'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                  icon={<Search size={16} />}
                  className='hover:text-orange-500 hover:border-orange-500 transition-all duration-300'
                />
              </div>
            </div>
          </div>

          {/* Filter summary */}
          {(selectedService || selectedStatus || selectedDateRange || searchTerm) && (
            <div className='mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg transition-all duration-300 hover:shadow-md'>
              <Text className='text-sm font-medium text-orange-800'>Bộ lọc đang áp dụng:</Text>
              <div className='flex flex-wrap gap-2 mt-2'>
                {selectedService && (
                  <Tag
                    color='orange'
                    closable
                    onClose={() => {
                      setSelectedService(null)
                      fetchTestResults(null, selectedStatus)
                    }}
                    className='transition-all duration-300 hover:shadow-sm'
                  >
                    Dịch vụ: {services.find((s) => s.id === selectedService)?.name}
                  </Tag>
                )}
                {selectedStatus && (
                  <Tag
                    color='green'
                    closable
                    onClose={() => {
                      setSelectedStatus(null)
                      fetchTestResults(selectedService, null)
                    }}
                    className='transition-all duration-300 hover:shadow-sm'
                  >
                    Trạng thái: {statusOptions.find((s) => s.value === selectedStatus)?.label}
                  </Tag>
                )}
                {selectedDateRange && (
                  <Tag
                    color='blue'
                    closable
                    onClose={() => {
                      setSelectedDateRange(null)
                    }}
                    className='transition-all duration-300 hover:shadow-sm'
                  >
                    Ngày: {format(selectedDateRange[0], 'dd/MM/yyyy')} - {format(selectedDateRange[1], 'dd/MM/yyyy')}
                  </Tag>
                )}
                {searchTerm && (
                  <Tag
                    color='red'
                    closable
                    onClose={() => setSearchTerm('')}
                    className='transition-all duration-300 hover:shadow-sm'
                  >
                    Tìm kiếm: "{searchTerm}"
                  </Tag>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card className='border-0 shadow-md hover:shadow-lg transition-all duration-300'>
          {loading ? (
            <div className='flex justify-center items-center h-64'>
              <Spin size='large' tip='Đang tải dữ liệu...' className='text-orange-500' />
            </div>
          ) : testResults.length > 0 ? (
            <>
              <div className='flex justify-between mb-4 items-center'>
                <div className='bg-orange-50 px-3 py-2 rounded-lg border border-orange-100'>
                  <Text className='text-base'>
                    Tổng số: <strong className='text-orange-600'>{getFilteredData(testResults).length}</strong> kết quả
                    {(selectedService || selectedStatus || selectedDateRange || searchTerm) && (
                      <span className='ml-2 text-gray-500'>(đã lọc từ {testResults.length} kết quả)</span>
                    )}
                  </Text>
                </div>
                <div className='flex flex-wrap gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100'>
                  <Text strong className='mr-1 text-gray-700'>
                    Trạng thái:
                  </Text>
                  <Tag color='warning' className='flex items-center gap-1'>
                    <AlertTriangle size={12} /> Đã xét nghiệm:{' '}
                    {getFilteredData(testResults).filter((item) => item.status === 'tested').length}
                  </Tag>
                  <Tag color='success' className='flex items-center gap-1'>
                    <CheckCircle size={12} /> Đã có kết quả:{' '}
                    {getFilteredData(testResults).filter((item) => item.status === 'completed').length}
                  </Tag>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={getFilteredData(testResults)}
                rowKey='id'
                pagination={{ pageSize: 10 }}
                bordered
                className='rounded-lg shadow hover:shadow-md transition-all duration-300'
                rowClassName='hover:bg-orange-50 transition-all duration-300'
              />
            </>
          ) : (
            <Empty
              description={
                <span className='text-gray-500'>
                  {selectedService || selectedStatus || selectedDateRange || searchTerm
                    ? 'Không có dữ liệu kết quả xét nghiệm cho bộ lọc này'
                    : 'Không có dữ liệu kết quả xét nghiệm'}
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className='my-12'
            />
          )}
        </Card>

        {/* Upload Result Modal */}
        <Modal
          title={
            <span className='font-bold flex items-center gap-2'>
              <UploadCloud size={20} className='text-orange-500' /> Tải lên kết quả xét nghiệm
            </span>
          }
          open={isUploadModalOpen}
          footer={null}
          onCancel={() => setIsUploadModalOpen(false)}
          maskClosable={false}
          width={600}
          centered
          className='rounded-lg'
        >
          <div className='py-4'>
            {selectedRecord && (
              <div className='mb-6 p-5 bg-orange-50 rounded-lg border border-orange-100 transition-all duration-300 hover:shadow-md'>
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

            <div className='mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 transition-all duration-300 hover:shadow-md'>
              <div className='flex items-start'>
                <AlertTriangle size={20} className='mr-2 mt-0.5 flex-shrink-0 animate-pulse' />
                <div>
                  <p className='font-medium'>Lưu ý quan trọng</p>
                  <p className='text-sm'>
                    Sau khi tải lên kết quả xét nghiệm, trạng thái sẽ được cập nhật thành <b>"Đã có kết quả"</b> và
                    khách hàng sẽ nhận được thông báo.
                  </p>
                </div>
              </div>
            </div>

            <Dragger
              name='file'
              customRequest={handleUpload}
              accept='.pdf'
              showUploadList={true}
              maxCount={1}
              disabled={uploadLoading}
              className='p-8 border border-dashed border-gray-300 bg-gray-50 rounded-lg hover:border-orange-300 transition-all duration-300'
            >
              <p className='ant-upload-drag-icon'>
                <Inbox size={48} className='text-orange-500 mx-auto' />
              </p>
              <p className='ant-upload-text font-medium'>Nhấp hoặc kéo file vào khu vực này để tải lên</p>
              <p className='ant-upload-hint text-gray-500'>Chỉ hỗ trợ tải lên file PDF duy nhất</p>
            </Dragger>

            {/* Thêm status indicator */}
            <UploadStatusIndicator bookingDetailId={selectedRecord?.bookingId} />

            <div className='mt-6 text-center'>
              <Button
                loading={uploadLoading}
                type='primary'
                size='large'
                icon={<UploadCloud size={18} />}
                className='bg-orange-600 hover:bg-orange-700 transition-all duration-300 border-orange-600 hover:border-orange-700 hover:shadow-md'
              >
                Tải lên kết quả xét nghiệm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default TestResultsByService
