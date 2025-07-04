import React, { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import api from '@/configs/axios'
import { formatDistanceToNow, addHours } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useSelector } from 'react-redux'

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const userInfo = useSelector((state) => state.user.userInfo)

  const fetchNotifications = async () => {
    if (!userInfo) return

    try {
      setLoading(true)
      const response = await api.get('/api/Notification')
      console.log('Notification API response:', response)

      if (response && response.data) {
        console.log('Notifications received:', response.data)
        setNotifications(response.data)
      } else {
        console.warn('No notifications data in response', response)
        setNotifications([])
      }

      // Lấy số lượng thông báo chưa đọc
      const countResponse = await api.get('/api/Notification/count')
      console.log('Unread count response:', countResponse)

      if (countResponse && countResponse.data !== undefined) {
        setUnreadCount(countResponse.data)
      } else {
        console.warn('Invalid unread count response', countResponse)
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        console.error('Status code:', error.response.status)
      }
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!userInfo) return

    const originalNotifications = [...notifications]
    const originalUnreadCount = unreadCount

    // Optimistic update
    setNotifications(
      notifications.map((notif) => (notif.notificationId === notificationId ? { ...notif, isRead: true } : notif))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    try {
      console.log('Marking notification as read:', notificationId)
      const response = await api.put(`/api/Notification/${notificationId}/read`)
      console.log('Mark as read response:', response)

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      setNotifications(originalNotifications)
      setUnreadCount(originalUnreadCount)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    if (!userInfo || unreadCount === 0) return

    try {
      console.log('Marking all notifications as read')
      const response = await api.put('/api/Notification/mark-all-read')
      console.log('Mark all as read response:', response)

      // Cập nhật state
      setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (userInfo) {
      fetchNotifications()

      // // Set up polling for new notifications (every 30 seconds)
      // const interval = setInterval(fetchNotifications, 30000)
      // return () => clearInterval(interval)
    }
  }, [userInfo])

  // Helper function to convert UTC to Vietnam time (UTC+7)
  const convertToVietnamTime = (dateString) => {
    const utcDate = new Date(dateString)
    return addHours(utcDate, 7)
  }

  if (!userInfo) return null

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-50 transition-colors relative'
        onClick={() => setIsOpen(!isOpen)}
        aria-label='Thông báo'
      >
        <Bell className='w-5 h-5 text-gray-700' />
        {unreadCount > 0 && (
          <Badge className='absolute -top-1 -right-1 px-1.5 py-0.5 bg-primary-500 text-white min-w-[18px] h-[18px] flex items-center justify-center text-xs'>
            {unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-100'>
          <div className='p-3 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='font-semibold text-gray-800'>Thông báo</h3>
            {unreadCount > 0 && (
              <button className='text-xs text-primary-600 hover:text-primary-800' onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className='max-h-[350px] overflow-y-auto'>
            {loading ? (
              <div className='p-4 text-center text-gray-500'>Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className='p-4 text-center text-gray-500'>Bạn chưa có thông báo nào</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                    !notification.isRead ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.notificationId)}
                >
                  <div className='flex items-start'>
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${
                        !notification.isRead ? 'bg-primary-500' : 'bg-transparent'
                      }`}
                    ></div>
                    <div className='flex-1'>
                      <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-800' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm ${!notification.isRead ? 'font-medium' : 'text-gray-700'}`}>
                        {notification.content}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {formatDistanceToNow(convertToVietnamTime(notification.createdAt), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='p-2 text-center border-t border-gray-100'>
            <button className='text-xs text-primary-600 hover:underline' onClick={() => setIsOpen(false)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
