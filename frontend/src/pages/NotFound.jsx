import { useLocation, Link } from 'react-router-dom' // Sử dụng Link để điều hướng SPA tốt hơn
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: Người dùng cố gắng truy cập vào đường dẫn không tồn tại:', location.pathname)
  }, [location.pathname])

  return (
    <div className='min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white'>
      <div className='bg-white shadow-2xl rounded-xl p-8 sm:p-12 text-center max-w-md sm:max-w-lg w-full'>
        <h1 className='text-8xl sm:text-9xl font-extrabold text-indigo-600 mb-4'>404</h1>
        <p className='text-2xl sm:text-3xl font-semibold text-slate-800 mb-3'>Oops! Trang không tồn tại</p>
        <p className='text-slate-600 mb-10 text-base sm:text-lg'>
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có thể trang đã bị xoá, đổi tên hoặc chưa bao
          giờ tồn tại.
        </p>
        <Link
          to='/'
          className='inline-block px-8 py-3 text-base sm:text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all duration-200 ease-in-out transform hover:scale-105'
        >
          Quay về Trang Chủ
        </Link>
      </div>
      <p className='mt-10 text-sm text-slate-500'>
        Nếu bạn cho rằng đây là một lỗi, vui lòng{' '}
        <Link to='/contact' className='font-medium text-indigo-600 hover:text-indigo-500'>
          liên hệ với chúng tôi
        </Link>
        .
      </p>
    </div>
  )
}

export default NotFound
