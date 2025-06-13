import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Frown } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: Người dùng cố gắng truy cập vào đường dẫn không tồn tại:', location.pathname)
  }, [location.pathname])

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gradient-soft px-4 py-8'>
      <div className='bg-white/90 shadow-2xl rounded-2xl p-8 sm:p-12 text-center max-w-md sm:max-w-lg w-full animate-fade-in'>
        <div className='flex justify-center mb-4'>
          <span className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary shadow-lg'>
            <Frown className='w-12 h-12 text-white' />
          </span>
        </div>
        <h1 className='text-7xl sm:text-8xl font-extrabold gradient-text mb-2 tracking-tight'>404</h1>
        <p className='text-2xl sm:text-3xl font-semibold text-gray-900 mb-3'>Trang không tồn tại</p>
        <p className='text-gray-600 mb-8 text-base sm:text-lg'>
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
          <br />
          Có thể đường dẫn đã bị xoá, đổi tên hoặc chưa bao giờ tồn tại.
        </p>
        <Link
          to='/'
          className='inline-block px-8 py-3 text-base sm:text-lg font-semibold rounded-lg bg-gradient-primary text-white shadow-md hover:opacity-90 transition-all duration-150'
        >
          Quay về Trang Chủ
        </Link>
      </div>
      <p className='mt-10 text-sm text-gray-500 text-center'>
        Nếu bạn cho rằng đây là một lỗi, vui lòng{' '}
        <Link to='/contact' className='font-medium text-pink-600 hover:underline'>
          liên hệ với chúng tôi
        </Link>
        .
      </p>
    </div>
  )
}

export default NotFound
