import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, Settings } from 'lucide-react'
import JobTrigger from '@/components/JobTrigger'

const JobManagement = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Quản lý Background Jobs</h1>
        <p className='text-gray-600'>Quản lý và trigger các background job trong hệ thống</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Slot Generation Job */}
        <JobTrigger />

        {/* Job Schedule Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Lịch trình Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                <div>
                  <h4 className='font-medium text-blue-900'>Slot Generation</h4>
                  <p className='text-sm text-blue-700'>Tạo slot cho tuần tiếp theo</p>
                </div>
                <Clock className='h-4 w-4 text-blue-500' />
              </div>

              <div className='text-sm text-gray-600'>
                <p>
                  <strong>Lịch chạy:</strong> Mỗi thứ 2 lúc 00:00
                </p>
                <p>
                  <strong>Cron:</strong> 0 0 * * 1
                </p>
                <p>
                  <strong>Trạng thái:</strong> <span className='text-green-600'>Đang hoạt động</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hangfire Dashboard Link */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Hangfire Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-gray-600'>Truy cập Hangfire Dashboard để xem chi tiết các job và trạng thái</p>

            <div className='space-y-2'>
              <a
                href='/hangfire'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Settings className='h-4 w-4' />
                Mở Dashboard
              </a>

              <p className='text-xs text-gray-500'>Lưu ý: Dashboard chỉ có thể truy cập từ backend domain</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử Jobs gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-gray-500'>
            <Clock className='h-12 w-12 mx-auto mb-4 text-gray-300' />
            <p>Lịch sử job sẽ được hiển thị ở đây</p>
            <p className='text-sm'>Sử dụng Hangfire Dashboard để xem chi tiết</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default JobManagement
