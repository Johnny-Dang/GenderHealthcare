import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loading from '@/components/Loading'
import { Award, User, Briefcase, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/configs/axios'
import { useToast } from '../hooks/useToast'

const ConsultantList = ({
  showBookingButton = true,
  onConsultantSelect = null,
  className = '',
  cardClassName = '',
  gridCols = 'lg:grid-cols-3'
}) => {
  const [loading, setLoading] = useState(true)
  const { showError } = useToast()
  const [consultants, setConsultants] = useState([])

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/consultants')
        setConsultants(response.data)
      } catch (error) {
        showError('Không thể tải danh sách tư vấn viên' + (error.response?.data?.message || ''))
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  const getInitialAvatar = (name) => {
    if (!name) return 'U'
    return name.charAt(0).toUpperCase()
  }

  const handleConsultantAction = (consultant) => {
    if (onConsultantSelect) {
      onConsultantSelect(consultant)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (consultants.length === 0) {
    return (
      <div className='text-center py-16 max-w-md mx-auto'>
        <div className='w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-primary-100'>
          <User className='w-10 h-10 text-primary-400' />
        </div>
        <p className='text-gray-500 text-lg'>Chưa có tư vấn viên nào trong hệ thống</p>
      </div>
    )
  }

  return (
    <div className={`grid ${gridCols} gap-8 ${className}`}>
      {consultants.map((consultant) => (
        <Card
          key={consultant.id}
          className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${cardClassName}`}
        >
          <CardContent className='p-8 text-center'>
            <div className='relative inline-block mb-6'>
              {consultant.avatarUrl ? (
                <img
                  src={consultant.avatarUrl}
                  alt={consultant.fullName}
                  className='w-24 h-24 rounded-full object-cover mx-auto'
                />
              ) : (
                <div className='w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-2xl mx-auto'>
                  {getInitialAvatar(consultant.fullName)}
                </div>
              )}
              <div className='absolute -bottom-2 -right-2 bg-gradient-primary text-white rounded-full p-2'>
                <Award className='w-4 h-4' />
              </div>
            </div>

            <h3 className='text-xl font-bold text-gray-900 mb-2'>{consultant.fullName}</h3>
            {consultant.department && <p className='text-primary-600 font-medium mb-2'>{consultant.department}</p>}
            {consultant.yearOfExperience > 0 && (
              <p className='text-gray-600 mb-4'>{consultant.yearOfExperience} năm kinh nghiệm</p>
            )}

            <div className='space-y-3 mb-6'>
              {consultant.degree && (
                <div className='bg-gray-50 p-3 rounded-lg'>
                  <p className='text-sm font-medium text-gray-700'>Học vấn:</p>
                  <p className='text-sm text-gray-600'>{consultant.degree}</p>
                </div>
              )}
              {consultant.biography && (
                <div className='bg-primary-50 p-3 rounded-lg border-l-2 border-primary-300'>
                  <p className='text-sm text-gray-600 italic'>
                    "
                    {consultant.biography.length > 100
                      ? `${consultant.biography.slice(0, 100)}...`
                      : consultant.biography}
                    "
                  </p>
                </div>
              )}
              <div className='flex justify-center flex-wrap gap-2'>
                {consultant.yearOfExperience > 0 && (
                  <div className='bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium rounded-full py-1 px-3 flex items-center'>
                    <Award className='w-3 h-3 mr-1' />
                    <span>{consultant.yearOfExperience}+ năm kinh nghiệm</span>
                  </div>
                )}
                {consultant.degree && (
                  <div className='bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium rounded-full py-1 px-3 flex items-center'>
                    <GraduationCap className='w-3 h-3 mr-1' />
                    <span>Chuyên gia</span>
                  </div>
                )}
              </div>
            </div>

            {showBookingButton && (
              <Button
                asChild={!onConsultantSelect}
                className='w-full bg-gradient-primary hover:opacity-90 text-white'
                onClick={onConsultantSelect ? () => handleConsultantAction(consultant) : undefined}
              >
                {onConsultantSelect ? <span>Đặt lịch tư vấn</span> : <Link to='/booking-consultant'>Đặt tư vấn</Link>}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ConsultantList
