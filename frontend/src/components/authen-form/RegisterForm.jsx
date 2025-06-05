import React from 'react'
import { Button, Checkbox, Form, Input } from 'antd'
import './register.css'
function RegisterForm() {
  const onFinish = (values) => {
    console.log('Success:', values)
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  return (
    <div className='register-form'>
      <h1>Register</h1>
      <Form
        name='basic'
        layout='vertical'
        labelCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete='off'
      >
        <Form.Item
          label='Fullname'
          name='fullname'
          rules={[
            { required: true, message: 'Please input your fullname!' },
            { min: 2, message: 'Fullname must be at least 2 characters.' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label='Email'
          name='email'
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label='Username'
          name='username'
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label='Password'
          name='password'
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 6, message: 'Password must be at least 6 characters.' }
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label='Confirm Password'
          name='confirm'
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'))
              }
            })
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name='remember' valuePropName='checked' label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type='primary' htmlType='submit'>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default RegisterForm
