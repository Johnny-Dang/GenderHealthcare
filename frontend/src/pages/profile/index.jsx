import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import Avatar from '@/components/Avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from 'react-toastify'
import api from '@/configs/axios'

const ProfilePage = () => {
  const userInfo = useSelector((state) => state.user.userInfo)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    avatarUrl: '',
    roleName: '',
    yearOfExperience: '',
    degree: '',
    department: '',
    biography: ''
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Lấy thông tin user mới nhất từ API khi vào trang
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Tránh gọi API nhiều lần trong development mode với React.StrictMode
    if (fetchedRef.current) return

    if (!userInfo || !userInfo.accountId) {
      setFetching(false)
      return
    }

    setFetching(true)
    fetchedRef.current = true

    api
      .get(`/api/users/${userInfo.accountId}`)
      .then((res) => {
        setForm({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.slice(0, 10) : '',
          gender: res.data.gender === true ? 'male' : res.data.gender === false ? 'female' : '',
          avatarUrl: res.data.avatarUrl || '',
          roleName: res.data.roleName || userInfo.role,
          yearOfExperience: res.data.yearOfExperience !== undefined ? res.data.yearOfExperience : '',
          degree: res.data.degree || '',
          department: res.data.department || '',
          biography: res.data.biography || ''
        })
      })
      .catch((error) => {
        console.error('Error fetching profile:', error)
        toast.error('Không thể lấy thông tin người dùng')
      })
      .finally(() => setFetching(false))
  }, [userInfo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const isStaffOrConsultant =
    ['Staff', 'Consultant', 'Manager'].includes(userInfo.role) ||
    ['Staff', 'Consultant', 'Manager'].includes(form.roleName)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Tạo payload theo yêu cầu API
      let payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || '',
        avatarUrl: form.avatarUrl || '',
        dateOfBirth: form.dateOfBirth || '',
        gender: form.gender === 'male',
        roleName: form.roleName || userInfo.role
      }

      // Nếu là staff/consultant, thêm thông tin chuyên môn
      if (isStaffOrConsultant) {
        payload = {
          ...payload,
          yearOfExperience: form.yearOfExperience ? parseInt(form.yearOfExperience) : 0,
          degree: form.degree || '',
          department: form.department || '',
          biography: form.biography || ''
        }
      }

      await api.put(`/api/users/${userInfo.accountId}`, payload)
      toast.success('Cập nhật thông tin thành công!')
    } catch (error) {
      console.log('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = (uploadedUrl) => {
    setForm(prev => ({ ...prev, avatarUrl: uploadedUrl }))
  }

  if (!userInfo) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Navigation />
        <main className='flex-1 flex items-center justify-center bg-gray-50'>
          <Card className='p-8 text-center'>
            <h2 className='text-xl font-bold mb-2'>Bạn chưa đăng nhập</h2>
            <p className='mb-4 text-gray-500'>Vui lòng đăng nhập để cập nhật thông tin cá nhân.</p>
            <Button asChild>
              <a href='/login'>Đăng nhập</a>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  // Loading khi đang lấy dữ liệu từ API
  if (fetching) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Navigation />
        <main className='flex-1 flex items-center justify-center bg-gray-50'>
          <Card className='p-8 text-center'>
            <div className='animate-pulse text-pink-500 font-semibold'>Đang tải thông tin cá nhân...</div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-pink-50 to-white'>
      <Navigation />
      <main className='flex-1 py-12 px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Profile Header */}
          <div className='mb-8 text-center'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
              Thông tin <span className='text-pink-600'>cá nhân</span>
            </h1>
            <p className='text-gray-500'>Cập nhật thông tin cá nhân của bạn để đảm bảo trải nghiệm tốt nhất</p>
          </div>

          <Card className='overflow-hidden border-none shadow-lg'>
            {/* Profile Card Header with Avatar */}
            <div className='bg-gradient-to-r from-pink-400 to-pink-600 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 text-white'>
              <Avatar
                src={form.avatarUrl}
                alt="Avatar"
                size="2xl"
                fallbackText={`${form.firstName || ''} ${form.lastName || ''}`}
                className="border-white"
                clickable={true}
              />
              <div className='text-center sm:text-left'>
                <h2 className='text-2xl sm:text-3xl font-bold mb-1'>
                  {form.lastName} {form.firstName}
                </h2>
                <p className='text-pink-100'>{form.email}</p>
                {isStaffOrConsultant && (
                  <div className='mt-2 inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm'>
                    {form.department || 'Chuyên viên y tế'}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className='p-6 sm:p-8 bg-white'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Personal Information Section */}
                <div>
                  <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
                    <span className='inline-block w-1.5 h-1.5 bg-pink-500 rounded-full mr-2'></span>
                    Thông tin cơ bản
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Họ</label>
                      <Input
                        name='lastName'
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        placeholder='Nhập họ'
                        className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Tên</label>
                      <Input
                        name='firstName'
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder='Nhập tên'
                        className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Email</label>
                      <Input
                        name='email'
                        value={form.email}
                        onChange={handleChange}
                        required
                        type='email'
                        placeholder='Nhập email'
                        disabled
                        className='bg-gray-50'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Số điện thoại</label>
                      <Input
                        name='phone'
                        value={form.phone}
                        onChange={handleChange}
                        required
                        placeholder='Nhập số điện thoại'
                        className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Ngày sinh</label>
                      <Input
                        name='dateOfBirth'
                        type='date'
                        value={form.dateOfBirth}
                        onChange={handleChange}
                        required
                        className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                      />
                    </div>
                    <div className='space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Giới tính</label>
                      <select
                        name='gender'
                        value={form.gender}
                        onChange={handleChange}
                        className='w-full border border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 rounded-md px-3 py-2 transition-all'
                        required
                      >
                        <option value=''>Chọn giới tính</option>
                        <option value='male'>Nam</option>
                        <option value='female'>Nữ</option>
                      </select>
                    </div>
                    <div className='md:col-span-2 space-y-1'>
                      <label className='block text-sm font-medium text-gray-700'>Ảnh đại diện</label>
                      <CloudinaryUpload
                        onUploadSuccess={handleAvatarUpload}
                        currentAvatarUrl={form.avatarUrl}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                {isStaffOrConsultant && (
                  <div>
                    <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center border-t pt-6'>
                      <span className='inline-block w-1.5 h-1.5 bg-pink-500 rounded-full mr-2'></span>
                      Thông tin chuyên môn
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                      <div className='space-y-1'>
                        <label className='block text-sm font-medium text-gray-700'>Năm kinh nghiệm</label>
                        <Input
                          name='yearOfExperience'
                          type='number'
                          min={0}
                          value={form.yearOfExperience}
                          onChange={handleChange}
                          placeholder='Nhập số năm kinh nghiệm'
                          className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                        />
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-medium text-gray-700'>Bằng cấp / Học vị</label>
                        <Input
                          name='degree'
                          value={form.degree}
                          onChange={handleChange}
                          placeholder='VD: Thạc sĩ Y khoa, Tiến sĩ...'
                          className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                        />
                      </div>
                      <div className='space-y-1'>
                        <label className='block text-sm font-medium text-gray-700'>Chuyên khoa / Bộ phận</label>
                        <Input
                          name='department'
                          value={form.department}
                          onChange={handleChange}
                          placeholder='VD: Sản phụ khoa, Nội tiết...'
                          className='border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all'
                        />
                      </div>
                      <div className='md:col-span-2 space-y-1'>
                        <label className='block text-sm font-medium text-gray-700'>Giới thiệu bản thân</label>
                        <textarea
                          name='biography'
                          value={form.biography}
                          onChange={handleChange}
                          className='w-full border border-gray-300 focus:border-pink-500 focus:ring focus:ring-pink-200 rounded-md px-3 py-2 transition-all'
                          rows={3}
                          placeholder='Mô tả ngắn về bản thân, thành tích, kinh nghiệm...'
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className='pt-2'>
                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-white py-2.5'
                    disabled={loading}
                  >
                    {loading ? 'Đang cập nhật...' : 'Lưu thông tin'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProfilePage
