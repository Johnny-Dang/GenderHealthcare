import React from 'react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ConsultantList from '@/components/ConsultantList'

const ViewConsultation = () => {
  return (
    <div className='min-h-screen'>
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold text-gray-900 mb-6'>
              Đội ngũ <span className='gradient-text'>tư vấn viên</span>
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Các chuyên gia giàu kinh nghiệm, tận tâm chăm sóc sức khỏe của bạn
            </p>
          </div>

          <ConsultantList />
        </div>
      </section>
    </div>
  )
}

export default ViewConsultation
