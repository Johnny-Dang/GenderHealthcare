import React, { useState, useRef, useEffect } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

// CaptchaComponent giữ nguyên
const CaptchaComponent = ({
  onChange,
  sitekey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
  theme = 'light',
  size = 'normal',
  tabindex = 0
}) => {
  const recaptchaRef = useRef(null)

  useEffect(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }, [])

  const handleChange = (token) => {
    if (onChange) onChange(token)
  }

  return (
    <div className='recaptcha-container my-4'>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={sitekey}
        onChange={handleChange}
        theme={theme}
        size={size}
        tabindex={tabindex}
      />
    </div>
  )
}

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!email) newErrors.email = 'Username / Email / Phone is required'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    if (!captchaVerified) {
      setServerError("Please verify that you're not a robot.")
      return
    }

    try {
      const res = await fetch('http://14.225.210.212:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      localStorage.setItem('token', data.token)
      navigate('/')
    } catch (err) {
      setServerError(err.message)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-pink-50 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        <h1 className='text-3xl font-bold text-pink-600 mb-6 text-center'>Login</h1>

        <form onSubmit={handleLogin} className='space-y-4'>
          {/* Username */}
          <div>
            <label className='block text-sm font-medium mb-1 text-gray-700'>Username / Email</label>
            <input
              type='text'
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
          </div>

          {/* Password with eye icon */}
          <div>
            <label className='block text-sm font-medium mb-1 text-gray-700'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full border px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400'
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-pink-500'
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
          </div>

          {/* Captcha */}
          <CaptchaComponent onChange={() => setCaptchaVerified(true)} />

          {/* Button */}
          <button
            type='submit'
            disabled={!captchaVerified}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
              captchaVerified
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Login
          </button>

          {/* Server error */}
          {serverError && <p className='text-red-500 text-sm text-center mt-2'>{serverError}</p>}
        </form>

        <p className='text-sm text-center text-gray-600 mt-6'>
          Don’t have an account?{' '}
          <Link to='/register' className='text-pink-600 font-medium hover:underline'>
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
