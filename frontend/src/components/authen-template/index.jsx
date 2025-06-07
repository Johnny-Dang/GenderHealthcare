import React from 'react'
import './index.css'
import LoginPage from '../authen-form/LoginPage'
import RegisterPage from '../authen-form/RegisterPage'
function AuthenTemplate({ isLogin }) {
  return (
    <div className='authen-template'>
      <div className='authen-template__form'>{isLogin ? <LoginPage /> : <RegisterPage />}</div>
      <div className='authen-template__image'></div>
    </div>
  )
}

export default AuthenTemplate
