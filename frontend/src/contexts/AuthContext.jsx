import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(undefined)

// Mock users data
const mockUsers = [
  { id: '1', email: 'admin@wellcare.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'staff@wellcare.com', password: 'staff123', name: 'Staff User', role: 'staff' },
  { id: '3', email: 'user@wellcare.com', password: 'user123', name: 'Regular User', role: 'user' },
  { id: '4', email: 'consultant@wellcare.com', password: 'consultant123', name: 'Consultant User', role: 'consultant' }
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    // NOTE: Cần API - GET /api/auth/me với Authorization header
    // const savedUser = localStorage.getItem('wellcare_user');
    // if (savedUser) {
    //   setUser(JSON.parse(savedUser));
    // }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // NOTE: Cần API - POST /api/auth/login
    // Body: { email, password }
    // Response: { user: {...}, token: "..." }
    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const userData = { id: foundUser.id, email: foundUser.email, name: foundUser.name, role: foundUser.role }
      setUser(userData)
      // NOTE: Cần lưu token - localStorage.setItem('wellcare_user', JSON.stringify(userData));
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (email, password, name) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // NOTE: Cần API - POST /api/auth/register
    // Body: { email, password, name }
    // Response: { user: {...}, token: "..." }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      setIsLoading(false)
      return false
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user'
    }

    setUser(newUser)
    // NOTE: Cần lưu token - localStorage.setItem('wellcare_user', JSON.stringify(newUser));
    setIsLoading(false)
    return true
  }

  const logout = () => {
    // NOTE: Cần API - POST /api/auth/logout
    setUser(null)
    // NOTE: Cần xóa token - localStorage.removeItem('wellcare_user');
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
