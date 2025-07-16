import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loading from '@/components/Loading'
import { Award, User, Briefcase, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '@/configs/axios'

const ConsultantList = ({
  showBookingButton = true,
  onConsultantSelect = null,
  className = '',
  cardClassName = ''
}) => {
  const [loading, setLoading] = useState(true)
  const [consultants, setConsultants] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = React.useRef(null)
  const animationRef = React.useRef(null)

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/consultants')
        setConsultants(response.data)
      } catch (error) {
        console.error('Error fetching consultants:', error)
        toast.error('Không thể tải danh sách tư vấn viên')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultants()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (!loading && consultants.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      let scrollSpeed = 1.5 // pixels per frame (increased from 1)
      let direction = 1 // 1 for right, -1 for left

      const autoScroll = () => {
        if (!isPaused && container) {
          const maxScrollLeft = container.scrollWidth - container.clientWidth

          // Change direction when reaching edges
          if (container.scrollLeft >= maxScrollLeft) {
            direction = -1
          } else if (container.scrollLeft <= 0) {
            direction = 1
          }

          container.scrollLeft += scrollSpeed * direction
        }

        // Continue animation even when paused to allow instant resume
        animationRef.current = requestAnimationFrame(autoScroll)
      }

      // Start auto-scroll after a short delay
      const timeout = setTimeout(() => {
        animationRef.current = requestAnimationFrame(autoScroll)
      }, 2000)

      return () => {
        clearTimeout(timeout)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [loading, consultants.length, isPaused])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
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
    <div className={`${className}`}>
      <div
        ref={scrollContainerRef}
        className='overflow-x-auto scrollbar-hide scroll-smooth'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className='flex gap-6 pb-4' style={{ width: 'max-content' }}>
          {consultants.map((consultant) => (
            <Card
              key={consultant.id}
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex-shrink-0 w-80 ${cardClassName}`}
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
                    {onConsultantSelect ? (
                      <span>Đặt lịch tư vấn</span>
                    ) : (
                      <Link to='/booking-consultant'>Đặt tư vấn</Link>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className='flex justify-center mt-4'>
        <p className='text-sm text-gray-500 flex items-center'>
          <span className='mr-2'>←</span>
          Tự động cuộn hoặc kéo ngang để xem thêm
          <span className='ml-2'>→</span>
        </p>
      </div>
    </div>
  )
}

export default ConsultantList

// Add custom styles for smooth scrolling
const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
  }
  .scroll-smooth {
    scroll-behavior: smooth;
  }
  .scrollbar-hide:hover {
    scroll-behavior: auto; /* Allow manual scrolling when hovering */
  }
`

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}
