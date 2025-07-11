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
  Calendar
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
      await api.post(`/api/booking-details/${selectedRecord.id}/upload-result`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSuccess('ok')
      message.success('Tải lên kết quả xét nghiệm thành công')
      setIsUploadModalOpen(false)
      fetchTestResults(selectedService, selectedStatus)
    } catch (error) {
      onError(error)
      message.error('Không thể tải lên kết quả xét nghiệm')
    } finally {
      setUploadLoading(false)
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
      message.warning('Không có kết quả để tải xuống')
    }
  }

  const handleDateRangeChange = (dates) => {
    setSelectedDateRange(dates)
  }

  const clearAllFilters = () => {
    setSelectedService(null)
    setSelectedStatus(null)
    setSelectedDateRange(null)
    setSearchTerm('')
    fetchTestResults(null, null)
  }

  // Enhanced client-side filtering function
  const getFilteredData = (data) => {
    let filteredData = data

    // Filter by search term (name or phone)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredData = filteredData.filter(
        (item) => item.phone.toLowerCase().includes(term) || item.customerName.toLowerCase().includes(term)
      )
    }

    // Filter by date range
    if (selectedDateRange && selectedDateRange[0] && selectedDateRange[1]) {
      filteredData = filteredData.filter((item) => {
        const itemDate = new Date(item.testDate)
        const startDate = new Date(selectedDateRange[0])
        const endDate = new Date(selectedDateRange[1])

        // Set time to start/end of day for proper comparison
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)

        return itemDate >= startDate && itemDate <= endDate
      })
    }

    return filteredData
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
      width: 180,
      render: (text, record) => (
        <div>
          <span className='font-medium'>{text}</span>
          <div className='text-xs text-gray-500'>{record.phone}</div>
        </div>
      )
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

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <Card className='shadow-lg border-0 mb-8'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <Title level={2} className='!mb-1 gradient-text'>
              Kết quả xét nghiệm theo dịch vụ
            </Title>
            <Text type='secondary'>Quản lý kết quả xét nghiệm phân loại theo từng dịch vụ</Text>
          </div>
          <Space>
            <Button type='default' icon={<RefreshCw size={20} />} onClick={clearAllFilters} className='hover:shadow-sm'>
              Xóa tất cả bộ lọc
            </Button>
            <Button
              type='primary'
              icon={<RefreshCw size={20} />}
              onClick={() => fetchTestResults(selectedService, selectedStatus)}
              className='bg-blue-600 hover:bg-blue-700'
            >
              Làm mới dữ liệu
            </Button>
          </Space>
        </div>

        <div className='mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          <div className='min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Lọc theo dịch vụ:</label>
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
            >
              {services.map((service) => (
                <Option key={service.id} value={service.id}>
                  {service.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className='min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Lọc theo trạng thái:</label>
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
            >
              {statusOptions.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className='min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Lọc theo khoảng ngày:</label>
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
            />
          </div>

          <div className='min-w-[200px]'>
            <label className='block text-sm font-medium mb-2'>Tìm kiếm:</label>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='Tên hoặc SĐT...'
                className='w-full p-2 border border-gray-300 rounded text-sm'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button icon={<Search size={18} />} />
            </div>
          </div>
        </div>

        {/* Filter summary */}
        {(selectedService || selectedStatus || selectedDateRange || searchTerm) && (
          <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
            <Text className='text-sm font-medium text-blue-800'>Bộ lọc đang áp dụng:</Text>
            <div className='flex flex-wrap gap-2 mt-2'>
              {selectedService && (
                <Tag
                  color='blue'
                  closable
                  onClose={() => {
                    setSelectedService(null)
                    fetchTestResults(null, selectedStatus)
                  }}
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
                >
                  Trạng thái: {statusOptions.find((s) => s.value === selectedStatus)?.label}
                </Tag>
              )}
              {selectedDateRange && (
                <Tag
                  color='orange'
                  closable
                  onClose={() => {
                    setSelectedDateRange(null)
                  }}
                >
                  Ngày: {format(selectedDateRange[0], 'dd/MM/yyyy')} - {format(selectedDateRange[1], 'dd/MM/yyyy')}
                </Tag>
              )}
              {searchTerm && (
                <Tag color='red' closable onClose={() => setSearchTerm('')}>
                  Tìm kiếm: "{searchTerm}"
                </Tag>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card className='border-0 shadow-md'>
        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <Spin size='large' tip='Đang tải dữ liệu...' />
          </div>
        ) : testResults.length > 0 ? (
          <>
            <div className='flex justify-between mb-4 items-center'>
              <Text className='text-base'>
                Tổng số: <strong>{getFilteredData(testResults).length}</strong> kết quả
                {(selectedService || selectedStatus || selectedDateRange || searchTerm) && (
                  <span className='ml-2 text-gray-500'>(đã lọc từ {testResults.length} kết quả)</span>
                )}
              </Text>
              <div className='flex flex-wrap gap-2'>
                <Text strong className='mr-1'>
                  Trạng thái:
                </Text>
                <Tag color='warning'>
                  Đã xét nghiệm: {getFilteredData(testResults).filter((item) => item.status === 'tested').length}
                </Tag>
                <Tag color='success'>
                  Đã có kết quả: {getFilteredData(testResults).filter((item) => item.status === 'completed').length}
                </Tag>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={getFilteredData(testResults)}
              rowKey='id'
              pagination={{ pageSize: 10 }}
              bordered
              className='rounded-lg shadow'
            />
          </>
        ) : (
          <Empty
            description={
              selectedService || selectedStatus || selectedDateRange || searchTerm
                ? 'Không có dữ liệu kết quả xét nghiệm cho bộ lọc này'
                : 'Không có dữ liệu kết quả xét nghiệm'
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Upload Result Modal */}
      <Modal
        title={
          <span className='font-bold flex items-center gap-2'>
            <UploadCloud size={20} /> Tải lên kết quả xét nghiệm
          </span>
        }
        open={isUploadModalOpen}
        footer={null}
        onCancel={() => setIsUploadModalOpen(false)}
        maskClosable={false}
        width={600}
        centered
      >
        <div className='py-4'>
          {selectedRecord && (
            <div className='mb-6 p-5 bg-gray-50 rounded-lg border'>
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

          <div className='mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700'>
            <div className='flex items-start'>
              <AlertTriangle size={20} className='mr-2 mt-0.5 flex-shrink-0' />
              <div>
                <p className='font-medium'>Lưu ý quan trọng</p>
                <p className='text-sm'>
                  Sau khi tải lên kết quả xét nghiệm, trạng thái sẽ được cập nhật thành <b>"Đã có kết quả"</b> và khách
                  hàng sẽ nhận được thông báo.
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
            className='p-8 border border-dashed border-gray-300 bg-gray-50 rounded-lg'
          >
            <p className='ant-upload-drag-icon'>
              {/* Use lucide-react Inbox icon instead of InboxOutlined */}
              <Inbox size={48} />
            </p>
            <p className='ant-upload-text font-medium'>Nhấp hoặc kéo file vào khu vực này để tải lên</p>
            <p className='ant-upload-hint text-gray-500'>Chỉ hỗ trợ tải lên file PDF duy nhất</p>
          </Dragger>

          <div className='mt-6 text-center'>
            <Button loading={uploadLoading} type='primary' size='large' icon={<UploadCloud size={18} />}>
              Tải lên kết quả xét nghiệm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TestResultsByService
