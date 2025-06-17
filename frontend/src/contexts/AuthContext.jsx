import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/configs/axios'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)

    try {
      const response = await api.post('/Account/login', {
        email,
        password
      })

      if (response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        localStorage.setItem('token', JSON.stringify(response.data.token))
        setIsLoading(false)
        return true
      }
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }

    setIsLoading(false)
    return false
  }

  const register = async (email, password, name, additionalData) => {
    setIsLoading(true)

    try {
      // Convert string gender to boolean (true for male, false for female)
      const genderBoolean = additionalData.gender === 'male' ? true : false

      const response = await api.post('/Account/register', {
        email,
        password,
        name,
        firstName: additionalData.firstName,
        lastName: additionalData.lastName,
        phone: additionalData.phone,
        dateOfBirth: additionalData.dateOfBirth,
        gender: genderBoolean
      })

      if (response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        localStorage.setItem('token', JSON.stringify(response.data.token))
        setIsLoading(false)
        return true
      }
    } catch (error) {
      console.error('Register error:', error)
      setIsLoading(false)
      return false
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
