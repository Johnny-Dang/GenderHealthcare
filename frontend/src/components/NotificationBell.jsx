import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Bell, AlertCircle } from 'lucide-react'
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
  const [fetchError, setFetchError] = useState(null)
  const dropdownRef = useRef(null)
  const lastFetchRef = useRef(0)
  const abortControllerRef = useRef(null)

  const userInfo = useSelector((state) => state.user?.userInfo)
  const userId = useMemo(() => userInfo?.accountId, [userInfo])

  const fetchNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!userId || (loading && !forceRefresh)) return

      const now = Date.now()
      if (!forceRefresh && now - lastFetchRef.current < 30000) return

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        setLoading(true)
        setFetchError(null)

        const [notificationRes, countRes] = await Promise.all([
          api.get('/api/Notification', {
            signal: abortControllerRef.current.signal,
            _noToast: true,
            timeout: 8000
          }),
          api.get('/api/Notification/count', {
            signal: abortControllerRef.current.signal,
            _noToast: true,
            timeout: 8000
          })
        ])

        const notificationsData = notificationRes?.data
        if (Array.isArray(notificationsData)) {
          setNotifications(notificationsData)
        } else {
          setNotifications([])
        }

        const countData = countRes?.data
        setUnreadCount(typeof countData === 'number' ? countData : 0)
        lastFetchRef.current = now
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return
        }

        if (forceRefresh) {
          setFetchError('Không thể tải thông báo. Vui lòng thử lại sau.')
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [userId, loading]
  )

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
        // Silent fail
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
      // Silent fail
    }
  }, [userId, unreadCount])

  const handleToggleDropdown = useCallback(() => {
    const newState = !isOpen
    setIsOpen(newState)

    if (newState) {
      fetchNotifications(true)
    }
  }, [isOpen, fetchNotifications])

  const handleManualRefresh = useCallback(
    (e) => {
      e.stopPropagation()
      fetchNotifications(true)
    },
    [fetchNotifications]
  )

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
    if (loading && notifications.length === 0) {
      return <div className='p-4 text-center text-gray-500'>Đang tải...</div>
    }

    if (fetchError) {
      return (
        <div className='p-4 text-center'>
          <div className='flex flex-col items-center text-red-500 mb-2'>
            <AlertCircle className='h-5 w-5 mb-1' />
            <p className='text-sm'>{fetchError}</p>
          </div>
          <button
            className='mt-2 text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-md hover:bg-primary-100'
            onClick={handleManualRefresh}
          >
            Thử lại
          </button>
        </div>
      )
    }

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
  }, [notifications, loading, fetchError, markAsRead, handleManualRefresh, convertToVietnamTime])

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
            <div className='flex items-center gap-2'>
              <button
                className='text-xs text-gray-500 hover:text-primary-600'
                onClick={handleManualRefresh}
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Làm mới'}
              </button>

              {unreadCount > 0 && (
                <button className='text-xs text-primary-600 hover:text-primary-800' onClick={markAllAsRead}>
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
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
