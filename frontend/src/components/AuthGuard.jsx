import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const AuthGuard = ({ children, allowedRoles, redirectTo = '/' }) => {
  const navigate = useNavigate()
  const userInfo = useSelector((state) => state.user?.userInfo)

  useEffect(() => {
    if (!userInfo?.accountId || !userInfo?.role) {
      navigate(redirectTo)
      return
    }

    // Có allowedRoles → kiểm tra quyền
    if (allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
      if (!roles.includes(userInfo.role)) {
        navigate(redirectTo)
        return
      }
    }
  }, [userInfo, allowedRoles, navigate, redirectTo])

  // Không có user info → không render
  if (!userInfo?.accountId || !userInfo?.role) {
    return null
  }

  // Có allowedRoles nhưng không đủ quyền → không render
  if (allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    if (!roles.includes(userInfo.role)) {
      return null
    }
  }

  return children
}

export default AuthGuard
