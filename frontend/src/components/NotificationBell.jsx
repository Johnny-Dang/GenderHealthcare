import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const lastFetchRef = useRef(0)

  const userInfo = useSelector((state) => state.user?.userInfo)
  const userId = useMemo(() => userInfo?.accountId, [userInfo])

  const fetchNotifications = useCallback(async () => {
    if (!userId || loading) return

    const now = Date.now()
    if (now - lastFetchRef.current < 30000) return

    try {
      setLoading(true)
      const [notificationRes, countRes] = await Promise.all([
        api.get('/api/Notification'),
        api.get('/api/Notification/count')
      ])

      // Đảm bảo notifications luôn là array
      const notificationsData = notificationRes?.data
      if (Array.isArray(notificationsData)) {
        setNotifications(notificationsData)
      } else {
        console.warn('Notifications data is not an array:', notificationsData)
        setNotifications([])
      }

      // Đảm bảo unreadCount là number
      const countData = countRes?.data
      setUnreadCount(typeof countData === 'number' ? countData : 0)

      lastFetchRef.current = now
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [userId, loading])

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!userId) return

      setNotifications((prev) =>
        Array.isArray(prev)
          ? prev.map((notif) => (notif.notificationId === notificationId ? { ...notif, isRead: true } : notif))
          : []
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      try {
        await api.put(`/api/Notification/${notificationId}/read`)
      } catch (error) {
        console.error('Error marking as read:', error)
      }
    },
    [userId]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return

    setNotifications((prev) => (Array.isArray(prev) ? prev.map((notif) => ({ ...notif, isRead: true })) : []))
    setUnreadCount(0)

    try {
      await api.put('/api/Notification/mark-all-read')
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }, [userId, unreadCount])

  const handleToggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const convertToVietnamTime = useCallback((dateString) => {
    return addHours(new Date(dateString), 7)
  }, [])

  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const renderedNotifications = useMemo(() => {
    if (loading) {
      return <div className='p-4 text-center text-gray-500'>Đang tải...</div>
    }

    // Đảm bảo notifications là array trước khi dùng
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return <div className='p-4 text-center text-gray-500'>Bạn chưa có thông báo nào</div>
    }

    return notifications.map((notification) => (
      <div
        key={notification.notificationId}
        className={`p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
          !notification.isRead ? 'bg-primary-50' : ''
        }`}
        onClick={() => markAsRead(notification.notificationId)}
      >
        <div className='flex items-start'>
          <div
            className={`w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0 ${
              !notification.isRead ? 'bg-primary-500' : 'bg-transparent'
            }`}
          />
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
  }, [notifications, loading, markAsRead, convertToVietnamTime])

  if (!userInfo) return null

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        className='flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-50 transition-colors relative'
        onClick={handleToggleDropdown}
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

          <div className='max-h-[350px] overflow-y-auto'>{renderedNotifications}</div>

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
