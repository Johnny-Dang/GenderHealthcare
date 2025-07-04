import React, { useState } from 'react'
import { Layout, Typography, Input, Button, Table, Spin, Alert, Form, Card, Badge, Empty, Tag, Tooltip } from 'antd'
import {
  Search,
  FileText,
  User,
  Phone,
  CheckCircle,
  Clock,
  RefreshCw,
  Calendar,
  Filter,
  AlertCircle
} from 'lucide-react'
import api from '../../configs/axios'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import { motion, AnimatePresence } from 'framer-motion'

const { Content } = Layout
const { Title, Text } = Typography

const TestResultsPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại')
      return
    }

    setLoading(true)
    setError('')
    setSearched(true)

    try {
      const response = await api.get(`/api/TestResult/by-phone/${phoneNumber}`)
      setResults(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra khi tìm kiếm')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status) => {
    let config = {
      color: 'default',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      text: status || 'Đang xử lý',
      icon: <Clock className='w-4 h-4 mr-1 text-yellow-500' />
    }

    if (status && status.toLowerCase().includes('kết quả')) {
      config = {
        color: 'success',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        text: 'Đã có kết quả',
        icon: <CheckCircle className='w-4 h-4 mr-1 text-green-500' />
      }
    }

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center px-3 py-1.5 rounded-full ${config.bgColor} ${config.textColor} ${config.borderColor} border`}
      >
        {config.icon}
        <span className='font-medium'>{config.text}</span>
      </motion.div>
    )
  }

  const columns = [
    {
      title: 'Thông tin khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      width: '30%',
      render: (name) => (
        <motion.div
          className='flex flex-col gap-1'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className='flex items-center gap-2'>
            <Badge dot status='processing' color='pink' />
            <Text strong className='text-gray-800'>
              {name}
            </Text>
          </div>
          <div className='flex items-center text-gray-500 text-sm'>
            <Phone className='w-3.5 h-3.5 mr-1.5 text-pink-500' />
            <Text type='secondary'>{phoneNumber}</Text>
          </div>
          <Tag color='pink' style={{ marginTop: '4px' }} className='border-pink-300'>
            <span className='flex items-center'>
              <User className='w-3.5 h-3.5 mr-1' />
              Khách hàng
            </span>
          </Tag>
        </motion.div>
      )
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: '30%',
      render: (serviceName) => (
        <Tooltip title={serviceName}>
          <div className='flex items-center bg-pink-50 px-3 py-2 rounded-lg border border-pink-100 w-fit'>
            <FileText className='w-4 h-4 mr-2 text-pink-500' />
            <span className='font-medium'>{serviceName}</span>
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Kết quả',
      dataIndex: 'result',
      key: 'result',
      width: '30%',
      render: (result) => (
        <div className='flex bg-gray-50 p-3 rounded-lg border border-gray-100'>
          <FileText className='w-4 h-4 mr-2 mt-1 text-pink-400 flex-shrink-0' />
          <div className='overflow-hidden'>
            {result ? (
              <div className='line-clamp-2 text-gray-700'>{result}</div>
            ) : (
              <span className='text-gray-400 italic'>Chưa có kết quả</span>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => getStatusTag(status)
    }
  ]

  const stats = {
    total: results.length,
    completed: results.filter((r) => r.status && r.status.toLowerCase().includes('kết quả')).length,
    processing: results.filter((r) => !r.status || !r.status.toLowerCase().includes('kết quả')).length
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-pink-100'>
      <Navigation />

      <Content className='container mx-auto px-4 py-8 max-w-7xl'>
        <motion.div initial='hidden' animate='visible' variants={fadeIn} className='mb-8'>
          <div className='bg-white border border-pink-100 p-6 rounded-xl shadow-lg mb-6 bg-gradient-to-r from-white to-pink-50'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
              <div className='mb-4 md:mb-0'>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Title
                    level={3}
                    className='text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 m-0 flex items-center'
                  >
                    <FileText className='w-7 h-7 mr-3 text-pink-500' /> Tra cứu kết quả xét nghiệm
                  </Title>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Text className='text-pink-600'>Tìm kiếm và xem kết quả xét nghiệm của khách hàng</Text>
                </motion.div>
              </div>
              <motion.div className='flex gap-2' whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button
                  className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-shadow'
                  onClick={() => {
                    setPhoneNumber('')
                    setResults([])
                    setSearched(false)
                    setError('')
                  }}
                  type='button'
                >
                  <RefreshCw className='w-4 h-4' />
                  Làm mới
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className='shadow-lg rounded-xl bg-white p-6 mb-6 border border-pink-100'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.1)' }}
        >
          <Form layout='inline' onSubmit={handleSearch} className='mb-2'>
            <div className='w-full flex flex-wrap gap-4 items-center'>
              <div className='flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100 flex-grow md:flex-grow-0'>
                <Phone className='w-5 h-5 text-pink-400' />
                <input
                  placeholder='Nhập số điện thoại (Ví dụ: 0933444555)'
                  className='bg-transparent border-none w-full focus:outline-none'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{ minWidth: '250px' }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-shadow'
                onClick={handleSearch}
                disabled={loading}
                type='button'
              >
                <Search className='w-4 h-4' />
                Tìm kiếm
              </motion.button>
            </div>
          </Form>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center p-12 bg-white rounded-xl shadow-sm'
          >
            <Spin size='large' />
            <div className='mt-4 text-pink-600'>Đang tìm kiếm kết quả...</div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Alert
              message={error}
              type='error'
              showIcon
              icon={<AlertCircle className='text-red-500' />}
              style={{ marginBottom: '16px' }}
              className='rounded-lg shadow-sm'
            />
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && searched && Array.isArray(results) && results.length > 0 && (
            <motion.div
              className='bg-white rounded-xl shadow-lg border border-pink-100 overflow-hidden'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className='p-6'>
                {/* Tổng quan */}
                <motion.div
                  className='mb-8 grid grid-cols-1 md:grid-cols-3 gap-4'
                  variants={staggerContainer}
                  initial='hidden'
                  animate='visible'
                >
                  <motion.div
                    variants={cardVariants}
                    className='bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-6 shadow-sm border border-pink-200 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='text-3xl font-bold text-pink-600'>{stats.total}</div>
                        <div className='text-sm text-pink-700 font-medium mt-1'>Tổng số kết quả</div>
                      </div>
                      <div className='p-3 bg-pink-200 bg-opacity-50 rounded-full'>
                        <FileText className='w-6 h-6 text-pink-600' />
                      </div>
                    </div>
                    <div className='w-full h-2 bg-pink-200 bg-opacity-50 rounded-full mt-4'>
                      <div className='h-2 bg-pink-500 rounded-full' style={{ width: '100%' }}></div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={cardVariants}
                    className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 shadow-sm border border-green-200 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='text-3xl font-bold text-green-600'>{stats.completed}</div>
                        <div className='text-sm text-green-700 font-medium mt-1'>Đã hoàn thành</div>
                      </div>
                      <div className='p-3 bg-green-200 bg-opacity-50 rounded-full'>
                        <CheckCircle className='w-6 h-6 text-green-600' />
                      </div>
                    </div>
                    <div className='w-full h-2 bg-green-200 bg-opacity-50 rounded-full mt-4'>
                      <div
                        className='h-2 bg-green-500 rounded-full'
                        style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={cardVariants}
                    className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 shadow-sm border border-yellow-200 hover:shadow-md transition-shadow'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='text-3xl font-bold text-yellow-600'>{stats.processing}</div>
                        <div className='text-sm text-yellow-700 font-medium mt-1'>Đang xử lý</div>
                      </div>
                      <div className='p-3 bg-yellow-200 bg-opacity-50 rounded-full'>
                        <Clock className='w-6 h-6 text-yellow-600' />
                      </div>
                    </div>
                    <div className='w-full h-2 bg-yellow-200 bg-opacity-50 rounded-full mt-4'>
                      <div
                        className='h-2 bg-yellow-500 rounded-full'
                        style={{ width: `${stats.total ? (stats.processing / stats.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Table
                    dataSource={results.map((item) => ({ ...item, key: item.resultId }))}
                    columns={columns}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total) => `Tổng cộng: ${total} kết quả`,
                      showSizeChanger: true
                    }}
                    bordered
                    rowClassName={(record) => {
                      if (record.status && record.status.toLowerCase().includes('kết quả'))
                        return 'bg-green-50 hover:bg-green-100 transition-colors'
                      return 'bg-yellow-50 hover:bg-yellow-100 transition-colors'
                    }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<span className='text-gray-500'>Không tìm thấy kết quả</span>}
                        />
                      )
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!loading && searched && (!results || results.length === 0) && !error && (
            <motion.div
              className='bg-white p-8 rounded-xl shadow-lg text-center border border-pink-100'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className='text-gray-600 font-medium'>
                    Không tìm thấy kết quả xét nghiệm cho số điện thoại này
                  </span>
                }
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearched(false)}
                className='mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-shadow mx-auto'
              >
                <RefreshCw className='w-4 h-4' />
                Tìm kiếm lại
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </Content>

      <Footer />
    </div>
  )
}

export default TestResultsPage
