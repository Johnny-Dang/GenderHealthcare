import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import Avatar from '@/components/Avatar'
import { Upload, X, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '@/configs/axios'

const CloudinaryUpload = ({ onUploadSuccess, currentAvatarUrl, className = '' }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB')
      return
    }

    setFile(selectedFile)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/api/photo/upload', formData)
      const uploadedUrl = response.data.url
      
      // Call parent callback with the new URL
      onUploadSuccess(uploadedUrl)
      
      // Clear state
      setFile(null)
      setPreviewUrl(null)
      
      toast.success('Upload ảnh thành công!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data || 'Upload thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  const displayImage = previewUrl || currentAvatarUrl

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Display */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <Avatar
            src={displayImage}
            alt="Avatar preview"
            size="xl"
            fallbackText=""
            showFallback={!displayImage}
            clickable={true}
          />
          
          {/* Upload overlay for current avatar */}
          {!file && currentAvatarUrl && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-6 h-6 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* File Selection */}
      {!file && !currentAvatarUrl && (
        <div className="text-center">
          <label className="cursor-pointer">
            <div className="border-2 border-dashed border-pink-300 rounded-lg p-6 hover:border-pink-400 transition-colors">
              <Upload className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Chọn ảnh đại diện</p>
              <p className="text-xs text-gray-500">JPG, PNG, GIF, WebP (tối đa 5MB)</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* File Preview and Actions */}
      {file && (
        <div className="space-y-3">
          <div className="bg-pink-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-pink-100 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Upload ảnh
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Change Avatar Button for existing avatar */}
      {!file && currentAvatarUrl && (
        <div className="text-center">
          <label className="cursor-pointer">
            <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              <Upload className="w-4 h-4 mr-2" />
              Thay đổi ảnh
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default CloudinaryUpload 