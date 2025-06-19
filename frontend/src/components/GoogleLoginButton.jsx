import React, { useEffect } from 'react'
import api from '../configs/axios'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function GoogleLoginButton() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '137320849289-d8q97maftuq347tslj5276bjl1lc3jp5.apps.googleusercontent.com',

        callback: handleCredentialResponse
      })

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),

        { theme: 'outline', size: 'large', width: 240 }
      )
    }
  }, [])
  async function handleCredentialResponse(response) {
    try {
      const apiResponse = await api.post('Account/login-google', {
        credential: response.credential
      })

      if (apiResponse.data) {
        const userData = apiResponse.data
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', JSON.stringify(userData.token))

        // Update auth context with the user data
        setUser(userData)

        toast.success('Đăng nhập thành công!', {
          position: 'top-right',
          autoClose: 3000
        })

        navigate('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Đăng nhập thất bại!', {
        position: 'top-right',
        autoClose: 3000
      })
    }
  }

  return <div id='google-signin-button'></div>
}
