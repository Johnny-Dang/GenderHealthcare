import React from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='grid lg:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='space-y-4'>
            <Link to='/' className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center'>
                <Heart className='h-5 w-5 text-white' />
              </div>
              <span className='text-xl font-bold'>WellCare</span>
            </Link>
            <p className='text-gray-400 leading-relaxed'>
              Chăm sóc sức khỏe giới tính chuyên nghiệp, an toàn và riêng tư cho phụ nữ Việt Nam.
            </p>
            <div className='flex space-x-4'>
              <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer'>
                <span className='text-sm font-bold'>I</span>
              </div>
              <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer'>
                <span className='text-sm font-bold'>LOVE</span>
              </div>
              <div className='w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer'>
                <span className='text-sm font-bold'>YOU</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Liên kết nhanh</h3>
            <ul className='space-y-3'>
              <li>
                <Link to='/' className='text-gray-400 hover:text-white transition-colors'>
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to='/dich-vu' className='text-gray-400 hover:text-white transition-colors'>
                  Dịch vụ xét nghiệm
                </Link>
              </li>
              <li>
                <Link to='/tu-van' className='text-gray-400 hover:text-white transition-colors'>
                  Đặt tư vấn
                </Link>
              </li>
              <li>
                <Link to='/blog' className='text-gray-400 hover:text-white transition-colors'>
                  Blog
                </Link>
              </li>
              <li>
                <Link to='/chu-ky' className='text-gray-400 hover:text-white transition-colors'>
                  Theo dõi chu kỳ
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Dịch vụ</h3>
            <ul className='space-y-3'>
              <li className='text-gray-400'>Xét nghiệm hormone</li>
              <li className='text-gray-400'>Tầm soát ung thư</li>
              <li className='text-gray-400'>Tư vấn chuyên khoa</li>
              <li className='text-gray-400'>Theo dõi chu kỳ</li>
              <li className='text-gray-400'>Hỗ trợ tâm lý</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Liên hệ</h3>
            <div className='space-y-3 text-gray-400'>
              <p>📍 Test Test</p>
              <p>📞 123 456 789</p>
              <p>✉️ info@wellcare.vn</p>
              <p>🕒 T2-T6: 7:00 - 17:00</p>
            </div>
          </div>
        </div>

        <div className='border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-gray-400 text-sm'>© {new Date().getFullYear()} WellCare. Tất cả quyền được bảo lưu.</p>
          <div className='flex space-x-6 mt-4 md:mt-0'>
            <Link to='#' className='text-gray-400 hover:text-white text-sm transition-colors'>
              Chính sách bảo mật
            </Link>
            <Link to='#' className='text-gray-400 hover:text-white text-sm transition-colors'>
              Điều khoản sử dụng
            </Link>
            <Link to='#' className='text-gray-400 hover:text-white text-sm transition-colors'>
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
