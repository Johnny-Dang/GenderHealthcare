import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const useReduxReady = () => {
  const [isReady, setIsReady] = useState(false)
  const userState = useSelector((state) => state.user)

  useEffect(() => {
    // Đảm bảo state.user tồn tại
    if (userState !== undefined && userState !== null) {
      setIsReady(true)
    }
  }, [userState])

  return isReady
} 