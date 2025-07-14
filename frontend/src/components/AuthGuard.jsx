import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spin } from 'antd'

const AuthGuard = ({ children, allowedRoles, redirectTo = '/' }) => {
  const [isVerifying, setIsVerifying] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const navigate = useNavigate()

  const userInfo = useSelector((state) => state.user?.userInfo || {})

  useEffect(() => {
    const verifyAccess = () => {
      if (!userInfo || !userInfo.accountId || !userInfo.role) {
        // console.log('User not authenticated, redirecting to:', redirectTo)
        navigate(redirectTo)
        return
      }

      // Kiểm tra quyền truy cập nếu có yêu cầu
      if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

        if (!roles.includes(userInfo.role)) {
          // console.log(`Access denied. User role: ${userInfo.role}, Required roles: ${roles.join(', ')}`)
          navigate(redirectTo)
          return
        }
      }

      // Nếu kiểm tra qua, cho phép truy cập
      console.log('Access granted for:', userInfo.fullName || userInfo.email)
      setIsAllowed(true)
      setIsVerifying(false)
    }

    // Thêm timeout ngắn để đảm bảo Redux đã load
    const timeoutId = setTimeout(verifyAccess, 100)
    return () => clearTimeout(timeoutId)
  }, [userInfo, allowedRoles, navigate, redirectTo])

  if (isVerifying) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Spin size='large' tip='Đang xác thực quyền truy cập...' />
      </div>
    )
  }

  return isAllowed ? children : null
}

export default AuthGuard
