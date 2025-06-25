import React, { useEffect } from 'react'
import api from '../configs/axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { login } from '../redux/features/userSlice'

/**
 * Renders a Google Sign-In button and handles user authentication via Google OAuth.
 *
 * Initializes the Google Sign-In client on mount, renders the sign-in button, and processes the authentication response. On successful login, updates the Redux state, stores the access token, displays a success notification, and redirects to the home page. Displays an error notification if authentication fails.
 */
export default function GoogleLoginButton() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '1050001082894-ns5vqk3okd16mor0o71tdmemqnbdq5u0.apps.googleusercontent.com',

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

      if (apiResponse?.data.accessToken) {
        // Store user data and token in localStorage
        dispatch(login(apiResponse.data))
        localStorage.setItem('token', apiResponse.data.accessToken)

        toast.success('Đăng nhập thành công!', {
          position: 'top-right',
          autoClose: 3000
        })
        navigate('/')
      } else {
        toast.error('Dữ liệu phản hồi không hợp lệ')
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
