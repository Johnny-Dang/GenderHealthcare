import { Loader } from 'lucide-react'
import React from 'react'

function Loading() {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <div className='animate-spin mb-4'>
        <Loader size={40} className='text-primary-500' />
      </div>
      <p className='text-gray-600'>Đang tải ...</p>
    </div>
  )
}

export default Loading
