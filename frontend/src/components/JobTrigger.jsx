import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/configs/axios'

const JobTrigger = () => {
  const [loading, setLoading] = useState(false)
  const [jobStatus, setJobStatus] = useState(null)

  const triggerSlotGeneration = async () => {
    setLoading(true)
    try {
      const response = await api.post('/api/TestServiceSlot/trigger-slot-generation')

      if (response.data) {
        setJobStatus({
          jobId: response.data.jobId,
          message: response.data.message,
          timestamp: response.data.timestamp,
          status: 'enqueued'
        })

        toast.success('Job đã được đưa vào hàng đợi thành công!')
      }
    } catch (error) {
      console.error('Error triggering job:', error)
      toast.error('Không thể trigger job. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const checkJobStatus = async (jobId) => {
    try {
      const response = await api.get(`/api/TestServiceSlot/job-status/${jobId}`)

      if (response.data) {
        setJobStatus((prev) => ({
          ...prev,
          state: response.data.state,
          completedAt: response.data.completedAt
        }))
      }
    } catch (error) {
      console.error('Error checking job status:', error)
    }
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Play className='h-5 w-5' />
          Trigger Slot Generation Job
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-gray-600'>Chạy job tạo slot cho tuần tiếp theo ngay lập tức</p>

        <Button onClick={triggerSlotGeneration} disabled={loading} className='w-full'>
          {loading ? (
            <>
              <Clock className='h-4 w-4 mr-2 animate-spin' />
              Đang xử lý...
            </>
          ) : (
            <>
              <Play className='h-4 w-4 mr-2' />
              Chạy Job Ngay
            </>
          )}
        </Button>

        {jobStatus && (
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              {jobStatus.status === 'enqueued' ? (
                <Clock className='h-4 w-4 text-blue-500' />
              ) : jobStatus.state === 'Succeeded' ? (
                <CheckCircle className='h-4 w-4 text-green-500' />
              ) : (
                <AlertCircle className='h-4 w-4 text-yellow-500' />
              )}
              <span className='text-sm font-medium'>
                {jobStatus.status === 'enqueued'
                  ? 'Đã đưa vào hàng đợi'
                  : jobStatus.state === 'Succeeded'
                    ? 'Hoàn thành'
                    : 'Đang xử lý'}
              </span>
            </div>

            <div className='text-xs text-gray-600 space-y-1'>
              <p>Job ID: {jobStatus.jobId}</p>
              <p>Thời gian: {new Date(jobStatus.timestamp).toLocaleString('vi-VN')}</p>
              {jobStatus.state && <p>Trạng thái: {jobStatus.state}</p>}
            </div>

            {jobStatus.status === 'enqueued' && (
              <Button variant='outline' size='sm' className='mt-2' onClick={() => checkJobStatus(jobStatus.jobId)}>
                Kiểm tra trạng thái
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default JobTrigger
