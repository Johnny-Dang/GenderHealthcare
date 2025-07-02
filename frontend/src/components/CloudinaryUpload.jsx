import React from 'react'
import { Button } from '@/components/ui/button'
import Avatar from '@/components/Avatar'
import { Upload } from 'lucide-react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

const CloudinaryUpload = ({ onUploadSuccess, currentAvatarUrl, className = '', avatarSize = 'xl' }) => {
  const openWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary Widget chưa được load!');
      return;
    }
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        cropping: true,
        croppingAspectRatio: 1,
        multiple: false,
        maxImageFileSize: 2 * 1024 * 1024, // 2MB
        sources: ['local', 'google_drive'],
        googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        resourceType: 'image',
        showSkipCropButton: false,
        showPoweredBy: false,
        folder: 'avatars',
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          onUploadSuccess(result.info.secure_url)
        }
      }
    )
  }

  // Map avatarSize sang class width/height
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-28 h-28'
  }
  const avatarBoxClass = sizeClasses[avatarSize] || 'w-24 h-24'

  return (
    <div className={`space-y-2 flex flex-col items-center ${className}`}>
      <div
        className={`relative flex items-center justify-center group cursor-pointer ${avatarBoxClass}`}
        onClick={openWidget}
        title="Chọn hoặc thay đổi ảnh đại diện"
        style={{ minWidth: 0 }}
      >
        <Avatar
          src={currentAvatarUrl}
          alt="Avatar preview"
          size={avatarSize}
          fallbackText=""
          showFallback={!currentAvatarUrl}
          clickable={false}
        />
        {/* Overlay upload icon khi hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <Upload className="w-10 h-10 text-white mb-1" />
          <span className="text-sm font-semibold text-white drop-shadow-md" style={{textShadow: '0 1px 4px rgba(0,0,0,0.7)'}}>Chọn hoặc thay đổi ảnh</span>
        </div>
      </div>
    </div>
  )
}

export default CloudinaryUpload 