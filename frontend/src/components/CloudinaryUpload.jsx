import React from 'react'
import { Upload } from 'lucide-react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default'

const CloudinaryUpload = ({
  onUploadSuccess,
  currentImageUrl,
  className = '',
  folder = 'avatars',
  label = 'Tải lên ảnh',
  buttonClass = '',
  previewClass = '',
  size = 120 // preview size in px
}) => {
  const [previewUrl, setPreviewUrl] = React.useState(currentImageUrl || '')

  React.useEffect(() => {
    setPreviewUrl(currentImageUrl || '')
  }, [currentImageUrl])

  const openWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary Widget chưa được load!')
      return
    }
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        cropping: false,
        multiple: false,
        maxImageFileSize: 5 * 1024 * 1024, // 5MB
        sources: ['local', 'google_drive'],
        googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        resourceType: 'image',
        showSkipCropButton: false,
        showPoweredBy: false,
        folder: folder
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          setPreviewUrl(result.info.secure_url)
          onUploadSuccess(result.info.secure_url)
        }
      }
    )
  }

  return (
    <div className={`flex flex-col items-start gap-2 ${className}`}>
      <button
        type='button'
        onClick={openWidget}
        className={`inline-flex items-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded shadow transition ${buttonClass}`}
      >
        <Upload className='w-5 h-5 mr-2' />
        {label}
      </button>
      {previewUrl && (
        <img
          src={previewUrl}
          alt='Preview'
          className={`mt-2 rounded border ${previewClass}`}
          style={{ maxWidth: size, maxHeight: size }}
        />
      )}
    </div>
  )
}

export default CloudinaryUpload
