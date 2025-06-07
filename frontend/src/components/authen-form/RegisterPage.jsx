import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react' // optional: dùng icon lib hoặc đổi SVG

const RegisterPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.fullName) newErrors.fullName = 'Full name is required'
    if (!form.username) newErrors.username = 'Username / Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setServerMessage('')
    if (!validate()) return

    try {
      const res = await fetch('http://14.225.210.212:8080/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          password: form.password
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Register failed')

      setServerMessage('✅ Register successful!')
    } catch (err) {
      setServerMessage(`❌ ${err.message}`)
    }
  }

  const renderPasswordInput = (field, label, show, toggleShow) => (
    <div key={field}>
      <label className='block text-sm font-medium mb-1 text-gray-700'>{label}</label>
      <div className='relative'>
        <input
          type={show ? 'text' : 'password'}
          name={field}
          value={form[field]}
          onChange={handleChange}
          className={`w-full border px-4 py-2 rounded-lg pr-10 focus:outline-none focus:ring-2 ${
            errors[field] ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400'
          }`}
        />
        <button
          type='button'
          onClick={toggleShow}
          className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-pink-500'
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {errors[field] && <p className='text-red-500 text-sm mt-1'>{errors[field]}</p>}
    </div>
  )

  return (
    <div className='min-h-screen flex items-center justify-center bg-pink-50 px-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
        <h1 className='text-3xl font-bold text-pink-600 mb-6 text-center'>Register</h1>

        <form onSubmit={handleRegister} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium mb-1 text-gray-700'>Full Name</label>
            <input
              type='text'
              name='fullName'
              value={form.fullName}
              onChange={handleChange}
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.fullName ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400'
              }`}
            />
            {errors.fullName && <p className='text-red-500 text-sm mt-1'>{errors.fullName}</p>}
          </div>

          <div>
            <label className='block text-sm font-medium mb-1 text-gray-700'>Username / Email</label>
            <input
              type='text'
              name='username'
              value={form.username}
              onChange={handleChange}
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors.username ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:ring-pink-400'
              }`}
            />
            {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username}</p>}
          </div>

          {renderPasswordInput('password', 'Password', showPassword, () => setShowPassword(!showPassword))}
          {renderPasswordInput('confirmPassword', 'Confirm Password', showConfirmPassword, () =>
            setShowConfirmPassword(!showConfirmPassword)
          )}

          <button
            type='submit'
            className='w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-pink-600 transition-colors'
          >
            Register
          </button>

          {serverMessage && <p className='text-sm text-center mt-3'>{serverMessage}</p>}
        </form>

        <p className='text-sm text-center text-gray-600 mt-6'>
          Already have an account?{' '}
          <Link to='/login' className='text-pink-600 font-medium hover:underline'>
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
