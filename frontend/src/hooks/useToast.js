import { toast } from 'react-toastify'
import { useCallback } from 'react'

export const useToast = () => {
  const showSuccess = useCallback((message) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000
    })
  }, [])

  const showError = useCallback((message) => {
    toast.error(message || 'Đã xảy ra lỗi', {
      position: 'top-right',
      autoClose: 4000
    })
  }, [])

  const showInfo = useCallback((message) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 3000
    })
  }, [])

  const showWarning = useCallback((message) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 3000
    })
  }, [])

  // Compatibility function for components using the old toast API
  const toast_compat = useCallback(
    ({ title, description, variant = 'default' }) => {
      const message = description || title

      switch (variant) {
        case 'destructive':
          return showError(message)
        case 'success':
          return showSuccess(message)
        case 'warning':
          return showWarning(message)
        default:
          return showInfo(message)
      }
    },
    [showError, showSuccess, showWarning, showInfo]
  )

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    toast: toast_compat // For backward compatibility
  }
}
